exports.isAdmin = (req, res, next) => {
  // kiểm tra role
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Admin only" });

  next();
};
