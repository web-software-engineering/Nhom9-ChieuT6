const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors()); // cho phép frontend gọi API
app.use(express.json()); // đọc JSON body

// route chính
app.use("/api/auth", authRoutes);

module.exports = app;
