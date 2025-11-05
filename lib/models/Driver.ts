// lib/models/Driver.ts
import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    series: { type: String }, // e.g., "Standard Series", "High Power Series"
    wattageRange: { 
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    }, // e.g., min: 10, max: 50 for "10-50W driver"
    outputVoltage: { type: String }, // e.g., "12V DC", "24V DC"
    outputCurrent: { type: String }, // e.g., "4.16A"
    inputVoltage: { type: String }, // e.g., "100-240V AC"
    ipRating: { type: String }, // e.g., "IP67", "IP20"
    type: { type: String }, // e.g., "Constant Voltage", "Constant Current"
    price: { type: Number, required: true, default: 0 }, // Price in USD
    category: { type: String, default: 'Driver' },
    images: { type: [String], default: [] },
    productImages: { type: [String], default: [] },
    datasheets: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
