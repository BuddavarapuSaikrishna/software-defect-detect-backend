const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/upload.middleware");
const uploadController = require("../controllers/upload.controller");

router.post("/sample", (req, res) => {
  res.json({
    success: true,
    message: "Sample POST API working ✅",
    receivedData: req.body
  });
});

router.post("/upload", (req, res, next) => {
  uploadMiddleware(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadController.analyzeProject);

module.exports = router;
