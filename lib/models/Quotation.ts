import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  // Client / quotation data
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

  // Quotation identifier generated during creation (e.g. QL/PLD/BH/251223/025)
  quotationNumber: { type: String, required: true },

  // Snapshot of user registration info at time of quotation creation
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, required: true },
  userDepartment: { type: String, required: true },
  userCountry: { type: String, required: true },
  userMobile: { type: String, required: true },
  userCompanyName: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
