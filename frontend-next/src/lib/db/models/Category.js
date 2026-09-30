import mongoose from "mongoose";

// Single-vendor: the store's product categories (owner-managed).
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
  },
  subTitle: { type: String, default: "" },
  image: { type: String, default: "" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
