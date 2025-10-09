// scripts/change-password.js
// Run this script to change a user's password: node scripts/change-password.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config({ path: ".env.local" });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function changePassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Get user email
    const email = await question("Enter user email: ");

    // Find user
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      console.log("❌ User not found!");
      process.exit(1);
    }

    console.log(`\n✅ Found user: ${user.name} (${user.role})\n`);

    // Get new password
    const newPassword = await question("Enter new password (min 6 characters): ");

    if (newPassword.length < 6) {
      console.log("❌ Password must be at least 6 characters long!");
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question("Confirm new password: ");

    if (newPassword !== confirmPassword) {
      console.log("❌ Passwords do not match!");
      process.exit(1);
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("\n✅ Password changed successfully!");
    console.log(`Email: ${user.email}`);
    console.log("New password has been set.\n");

    process.exit(0);
  } catch (error) {
    console.error("Error changing password:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

changePassword();
