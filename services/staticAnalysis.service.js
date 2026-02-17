module.exports = async (projectPath) => {
  // Dummy result (replace with SonarQube execution)
  return {
    projectPath,
    bugs: 5,
    vulnerabilities: 2,
    codeSmells: 10
  };
};
