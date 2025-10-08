// lib/models/Product.ts
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    category: { type: String, required: true },
    application: { type: String },
    inputVoltage: { type: String },
    watt: { type: Number },
    lumen: { type: String },
    beamAngle: { type: String },
    dimension: { type: String },
    cutOut: { type: String },
    ipRating: { type: String },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ✅ No unique constraint at all
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
