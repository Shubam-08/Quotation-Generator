import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
