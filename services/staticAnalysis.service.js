const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const unzipUtil = require("../utils/unzip.util");
const sonarConfig = require("../config/sonar.config");

/**
 * Decide sonar.sources dynamically
 * - If src/ exists → use src
 * - Else → use project root
 */
function resolveSourcesDir(scanDir) {
  const srcPath = path.join(scanDir, "src");
  return fs.existsSync(srcPath) ? "src" : ".";
}

/**
 * Detect compiled Java bytecode
 * Returns relative path or null
 */
function resolveJavaBinaries(scanDir) {
  const candidates = [
    "target/classes",
    "build/classes",
    "out/production"
  ];

  for (const dir of candidates) {
    const fullPath = path.join(scanDir, dir);
    if (fs.existsSync(fullPath)) {
      return dir;
    }
  }
  return null;
}

exports.runStaticAnalysis = async (file) => {
  const token = sonarConfig.getToken();
  const hostUrl = sonarConfig.getHostUrl();
  const scannerPath = process.env.SONAR_SCANNER_PATH;

  if (!token) throw new Error("SONAR_TOKEN missing");
  if (!scannerPath) throw new Error("SONAR_SCANNER_PATH missing");
  if (!fs.existsSync(scannerPath)) {
    throw new Error("SonarScanner not found at: " + scannerPath);
  }

  /* -------------------------------------------------- */
  /* Project key = ZIP name + short UUID                */
  /* -------------------------------------------------- */
  const baseName = path.basename(
    file.originalname,
    path.extname(file.originalname)
  );
  const projectKey = `${baseName}_${uuidv4().slice(0, 8)}`;

  /* -------------------------------------------------- */
  /* Resolve scan directory                             */
  /* -------------------------------------------------- */
  let scanDir;

  if (file.originalname.toLowerCase().endsWith(".zip")) {
    scanDir = await unzipUtil.unzip(file.path);
  } else {
    scanDir = path.dirname(file.path);
  }

  if (!scanDir || !fs.existsSync(scanDir)) {
    throw new Error(`Scan directory not found: ${scanDir}`);
  }

  console.log("Scanning directory:", scanDir);
  console.log("Sonar project key:", projectKey);

  /* -------------------------------------------------- */
  /* Dynamic source + Java binaries detection           */
  /* -------------------------------------------------- */
  const sourcesDir = resolveSourcesDir(scanDir);
  const javaBinaries = resolveJavaBinaries(scanDir);

  console.log("Sonar sources:", sourcesDir);
  console.log("Java binaries:", javaBinaries || "NOT FOUND");

  /* -------------------------------------------------- */
  /* Build SonarScanner command                         */
  /* -------------------------------------------------- */
  let command =
    `"${scannerPath}" ` +
    `-Dsonar.projectKey=${projectKey} ` +
    `-Dsonar.projectName=${baseName} ` +
    `-Dsonar.sources=${sourcesDir} ` +
    `-Dsonar.inclusions=**/*.js,**/*.py,**/*.java ` +
    `-Dsonar.scm.disabled=true ` +
    `-Dsonar.host.url=${hostUrl} ` +
    `-Dsonar.token=${token}`;

  // ✅ Enable Java analysis ONLY if bytecode exists
  if (javaBinaries) {
    command += ` -Dsonar.java.binaries=${javaBinaries}`;
  } else {
    // Prevent Java crash if no .class files
    command += ` -Dsonar.exclusions=**/*.java`;
  }

  /* -------------------------------------------------- */
  /* Run SonarScanner in background                     */
  /* -------------------------------------------------- */
  exec(command, { cwd: scanDir, shell: true }, (err, stdout, stderr) => {
    if (err) {
      console.error("SONAR ERROR:", err.message);
      console.error(stderr);
      return;
    }
    console.log("Sonar analysis completed:", projectKey);
  });

  return {
    projectKey,
    projectName: baseName,
    sourcesUsed: sourcesDir,
    javaAnalyzed: !!javaBinaries,
    status: "STARTED"
  };
};
