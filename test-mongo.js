import mongoose from "mongoose";

const uri = "mongodb+srv://shubamgupta165_db_user:Test1234@cluster0.tdkywoy.mongodb.net/qlite_quotation?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  });
