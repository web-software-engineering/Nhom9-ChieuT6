import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    facebookId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
