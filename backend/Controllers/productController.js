import Product from "../Models/productModel.js";
import mongoose from "mongoose";

export const createOrUpdateProductController = async (req, res) => {
    try {
        const { _id, name, sellingPrice, currentStock } = req.body;

        // Validate required fields
        if (!name || sellingPrice === undefined || currentStock === undefined) {
            return res.status(400).json({ message: 'Missing required fields: name, sellingPrice, currentStock' });
        }

        // If _id is provided, try to update existing product
        if (_id) {
            // Validate if _id is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(400).json({ message: 'Invalid product ID format' });
            }

            const existingProduct = await Product.findById(_id);
            
            if (existingProduct) {
                // Update existing product
                const updatedProduct = await Product.findByIdAndUpdate(
                    _id,
                    {
                        name,
                        sellingPrice,
                        currentStock,
                        updataedAt: new Date()
                    },
                    { new: true }
                );
                return res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
            }
        }

        // Create new product if _id doesn't exist or not provided
        const newProduct = new Product({
            name,
            sellingPrice,
            currentStock,
            createdAt: new Date(),
            updataedAt: new Date()
        });
        await newProduct.save();
        return res.status(201).json({ message: 'Product created successfully', data: newProduct });
    } catch (error) {
        console.error('Error in createOrUpdateProduct:', error);
        return res.status(500).json({ message: 'Error processing product', error: error.message });
    }
}

export const getProductController = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching products', error });
    }
}   