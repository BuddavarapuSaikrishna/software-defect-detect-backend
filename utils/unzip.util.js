const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");

module.exports = async (zipPath) => {
  const extractPath = zipPath.replace(".zip", "");

  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  return extractPath;
};
