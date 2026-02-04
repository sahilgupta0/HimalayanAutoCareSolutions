import Sale from "../Models/salesModel.js";   


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