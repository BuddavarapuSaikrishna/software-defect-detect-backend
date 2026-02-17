require("dotenv").config(); // ✅ MUST be at top

const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/upload.routes");
const sampleRoutes = require("./routes/upload.routes");


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Routes
app.use("/api", uploadRoutes);

app.use('/api',sampleRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running successfully with .env ✅");
});

// Read PORT from .env
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
