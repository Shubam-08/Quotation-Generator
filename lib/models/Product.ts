// lib/models/Product.ts
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    application: { type: String },
    inputVoltage: { type: String },
    watt: { type: Number },
    lumen: { type: String },
    beamAngle: { type: String },
    price: { type: Number, required: true },
    images: { type: [String], default: [] }, // <-- new field
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
