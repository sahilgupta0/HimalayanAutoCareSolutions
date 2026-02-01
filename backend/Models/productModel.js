import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    currentStock: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updataedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);

export default Product;