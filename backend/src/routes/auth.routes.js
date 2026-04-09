const express = require("express");
const router = express.Router();

// import controller
const {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

// định nghĩa API
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

module.exports = router;
