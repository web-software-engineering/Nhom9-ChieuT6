import { Router } from "express";

const router = Router();

router.get("/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json({
    user: {
      id: req.user._id,
      displayName: req.user.displayName,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  });
});

export default router;
