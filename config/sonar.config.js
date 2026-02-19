module.exports = {
  getHostUrl: () => process.env.SONAR_HOST_URL,
  getToken: () => process.env.SONAR_TOKEN
};
