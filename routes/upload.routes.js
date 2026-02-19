const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const { analyzeProject } = require("../controllers/upload.controller");

router.post("/upload", upload.array("file", 1), analyzeProject);

module.exports = router;
