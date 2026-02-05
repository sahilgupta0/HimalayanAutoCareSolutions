import Sale from "../Models/salesModel.js";   
import Product from "../Models/productModel.js";


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
    const { items, subtotal, discount, total, customerId, salesPersonId } = req.body;
    try {
        const newSale = new Sale({
            items,
            subtotal,
            discount,
            total,
            customerId,
            salesPersonId
        });

        console.log('Creating new sale:', newSale);
        await newSale.save();
        return res.status(201).json({ message: 'Sales record created successfully', newSale });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating sales record', error });
    }
}

const getAvailableStock = async (productId, quantity    ) => {
    const product = await Product.findById(productId);

    if(product){
        if(product.currentStock >= quantity){
            product.currentStock -= quantity;
            await product.save();
        }
    }
    return product ? product.currentStock : 0;
}

export const acceptSaleController = async (req, res) => {
    const { saleId } = req.params;
    try {
        const sale = await Sale.findById(saleId);
       if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        let haveAllItems = true;

        for (const item of sale.items) {
            const availableStock = await getAvailableStock(item.productId, item.quantity); 
            if (availableStock < item.quantity) {
                haveAllItems = false;
                console.log(`Insufficient stock for product ${item.productId}. Available: ${availableStock}, Required: ${item.quantity}`);
                break;
            }
        
        }
        
        if (!haveAllItems) {
            return res.status(400).json({ message: 'Insufficient stock for one or more items' });
        }

        sale.status = 'Completed';
        await sale.save();
        return res.status(200).json({ message: 'Sale accepted successfully', sale });
    } catch (error) {
        return res.status(500).json({ message: 'Error accepting sale', error });
    }   
}

export const getPersonalSalesController = async (req, res) => {
    // Logic for fetching personal sales data
    const { salesPersonId } = req.params;
    console.log(`Received request for personal sales with salesPersonId: ${salesPersonId}`);
    try {
        const sales = await Sale.find({ salesPersonId }).populate('customerId');  
        
        console.log(`Fetching sales for salesPersonId: ${salesPersonId}`, sales);   
        return res.status(200).json(sales);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching personal sales', error });
    }   
}  