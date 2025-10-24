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
    // IP ratings with individual prices (stored in USD): [{ rating: "IP20", price: 59.00 }, { rating: "IP30", price: 120.00 }]
    // Price is optional - can be null/0 if not yet determined
    ipRatings: { 
      type: [{ 
        rating: { type: String, required: true }, 
        price: { type: Number, required: false, default: 0 } 
      }], 
      default: [] 
    },
    // Voltage variants with individual wattage and prices (stored in USD)
    // Example: [{ voltage: "12V DC", watt: 5, price: 45.00 }, { voltage: "24V DC", watt: 5, price: 48.00 }]
    voltageVariants: {
      type: [{
        voltage: { type: String, required: true },
        watt: { type: Number, required: false, default: 0 },
        price: { type: Number, required: false, default: 0 }
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
