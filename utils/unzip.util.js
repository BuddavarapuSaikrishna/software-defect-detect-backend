const unzipper = require("unzipper");
const fs = require("fs-extra");
const path = require("path");

const BASE_WORK_DIR = "D:/sonar-workspaces";

exports.unzip = async (zipPath) => {
  const projectName = path.basename(zipPath, ".zip");
  const extractPath = path.join(BASE_WORK_DIR, projectName);

  await fs.ensureDir(extractPath);

  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  return extractPath;
};
