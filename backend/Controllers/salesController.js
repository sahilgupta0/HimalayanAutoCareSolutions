import Sale from "../Models/salesModel.js";   
import Product from "../Models/productModel.js";
import e from "express";


export const getAllSalesController = async (req, res) => {
    // Logic for fetching sales data
    try {
        const sales = await Sale.find().populate('customerId').populate('salesPersonId');    
        return res.status(200).json(sales);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching sales', error });
    }
}


export const createSalesController = async (req, res) => {
    // Logic for creating a new sales record
    const { items, total, customerId, salesPersonId } = req.body;
    try {
        const newSale = new Sale({
            saleDate: new Date(), // Explicitly set current server time in UTC
            items,
            total,
            customerId,
            salesPersonId
        });

        await newSale.save();
        return res.status(201).json({ message: 'Sales record created successfully', newSale });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating sales record', error });
    }
}

const getAvailableStock = async (productId    ) => {
    const product = await Product.findById(productId);

    // if(product){
    //     if(product.currentStock >= quantity){
    //         product.currentStock -= quantity;
    //         await product.save();
    //     }
    // }
    return product ? product.currentStock : 0;
}

export const acceptSaleController = async (req, res) => {
    const { saleId } = req.params;
    try {
        const sale = await Sale.findById(saleId);
       if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        for (const item of sale.items) {
            const availableStock = await getAvailableStock(item.productId); 
            if (availableStock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${item.productName}. Available: ${availableStock}, Required: ${item.quantity}` });
            }
        }

        // Update stock for each product
        for (const item of sale.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.currentStock -= item.quantity;
                await product.save();
            }
        }

        sale.status = 'Completed';
        await sale.save();
        return res.status(200).json({ message: 'Sale accepted successfully', sale });
    } catch (error) {
        return res.status(500).json({ message: 'Error accepting sale', error });
    }   
}

export const rejectSalseController = async (req, res) => {
    const { saleId } = req.params;
    try {
        const sale = await Sale.findById(saleId);
         if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        sale.status = 'Cancelled';
        await sale.save();
        return res.status(200).json({ message: 'Sale rejected successfully', sale });
    } catch (error) {
        return res.status(500).json({ message: 'Error rejecting sale', error });
    }

}

export const getPersonalSalesController = async (req, res) => {
    // Logic for fetching personal sales data
    const { salesPersonId } = req.params;
    try {
        const sales = await Sale.find({ salesPersonId }).populate('customerId');  
          
        return res.status(200).json(sales);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching personal sales', error });
    }   
}  