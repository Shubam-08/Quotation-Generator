// lib/models/LightingControl.ts
import mongoose from "mongoose";

const LightingControlSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    
    // Control-specific fields (to be defined later)
    // Placeholder fields for now
    controlType: { type: String }, // e.g., "Dimmer", "Switch", "Controller", "Sensor"
    protocol: { type: String }, // e.g., "DMX512", "DALI", "0-10V", "Zigbee", "WiFi"
    channels: { type: Number }, // Number of channels
    loadCapacity: { type: String }, // e.g., "500W", "1000W"
    inputVoltage: { type: String }, // e.g., "110-240V AC"
    outputVoltage: { type: String }, // e.g., "12V DC", "24V DC"
    dimmingRange: { type: String }, // e.g., "0-100%"
    mounting: { type: String }, // e.g., "Wall Mount", "DIN Rail", "Surface Mount"
    connectivity: { type: String }, // e.g., "Wireless", "Wired", "Bluetooth"
    compatibility: { type: String }, // Compatible with which systems
    ipRating: { type: String }, // e.g., "IP20", "IP44"
    application: { type: String }, // e.g., "Residential", "Commercial", "Industrial"
    
    price: { type: Number, default: 0 }, // Base price in USD
    images: { type: [String], default: [] },
    productImages: { type: [String], default: [] },
    
    // File attachments
    datasheets: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    bisApproval: { type: [String], default: [] },
    isoCertificate: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.LightingControl || mongoose.model("LightingControl", LightingControlSchema);
