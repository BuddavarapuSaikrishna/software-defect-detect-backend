const path = require("path");
const staticAnalysisService = require("../services/staticAnalysis.service");

exports.analyzeProject = async (req, res) => {
  try {
    console.log("FILES:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const file = req.files[0];
    const ext = path.extname(file.originalname).toLowerCase();

    if (![".zip", ".js", ".py", ".java"].includes(ext)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type"
      });
    }

    // 🔥 Start analysis (non-blocking)
    const result = await staticAnalysisService.runStaticAnalysis(file);

    return res.status(202).json({
      success: true,
      message: "Analysis started",
      data: result
    });

  } catch (err) {
    console.error("UPLOAD CONTROLLER ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
