import express from "express";
import { getCustomers, changePassword, loginAdmin, changeUsername,updateUser  } from "../controllers/userController.js";


const router = express.Router();

// lấy danh sách khách hàng
router.get("/", getCustomers);
router.post("/login-admin", loginAdmin);

// đổi mật khẩu
router.post("/change-password", changePassword);
router.post("/change-username", changeUsername);
router.put("/:id", updateUser);
export default router;