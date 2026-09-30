import connectDB from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import { ApiError } from "@/lib/api/errors";

export async function listCategories() {
  await connectDB();
  return Category.find().sort({ order: 1, createdAt: 1 });
}

export async function createCategory({ name, subTitle, image, order }) {
  await connectDB();
  if (!name || !name.trim()) throw new ApiError("Category name is required", 400);

  const exists = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
  if (exists) throw new ApiError("Category already exists", 400);

  const count = await Category.countDocuments();
  return Category.create({
    name: name.trim(),
    subTitle: subTitle || "",
    image: image || "",
    order: typeof order === "number" ? order : count,
  });
}

export async function updateCategory(id, { name, subTitle, image, order }) {
  await connectDB();
  const category = await Category.findById(id);
  if (!category) throw new ApiError("Category not found", 404);

  if (name !== undefined) category.name = String(name).trim();
  if (subTitle !== undefined) category.subTitle = subTitle;
  if (image !== undefined) category.image = image;
  if (order !== undefined) category.order = Number(order) || 0;
  await category.save();
  return category;
}

export async function deleteCategory(id) {
  await connectDB();
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError("Category not found", 404);
}
