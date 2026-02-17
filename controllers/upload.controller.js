exports.analyzeProject = (req, res) => {
  console.log("FILES:", req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  const uploadedFile = req.files[0];

  res.json({
    success: true,
    message: "File uploaded successfully ✅",
    fileName: uploadedFile.originalname,
    savedAs: uploadedFile.filename
  });
};
