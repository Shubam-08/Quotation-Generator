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
    // IP ratings with individual prices: [{ rating: "IP20", price: 100 }, { rating: "IP30", price: 120 }]
    ipRatings: { 
      type: [{ 
        rating: { type: String, required: true }, 
        price: { type: Number, required: true } 
      }], 
      default: [] 
    },
    // Keep legacy fields for backward compatibility during migration
    ipRating: { type: [String], default: [] },
    price: { type: Number, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ✅ No unique constraint at all
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
