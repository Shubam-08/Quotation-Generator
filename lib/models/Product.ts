// lib/models/Product.ts
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    category: { type: String, required: true },
    categoryFilter: { type: String }, // Main category for filtering
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
    // File attachments stored in AWS S3
    datasheets: { type: [String], default: [] }, // URLs to datasheet PDFs
    iesFiles: { type: [String], default: [] }, // URLs to IES files
    certifications: { type: [String], default: [] }, // URLs to certification documents
    productImages: { type: [String], default: [] }, // Additional product images (separate from legacy images field)
  },
  { timestamps: true }
);

// ✅ No unique constraint at all
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
