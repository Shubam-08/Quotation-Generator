import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientEmail: String,
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  totalPrice: Number,
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
