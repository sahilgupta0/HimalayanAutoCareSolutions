
import Customer from '../Models/customerModel.js';

export const createCustomerController = async (req, res) => {
    // Logic for creating a new customer
    const {name, businessName, panNumber, district, area, phoneNumber} = req.body;
    // Here you would typically save the customer to the database
    const newCustomer = new Customer({name, businessName, panNumber, district, area, phoneNumber});
    await newCustomer.save();
    return res.status(201).json({message: 'Customer created successfully', newCustomer});
    
}

export const updateCustomerController = async (req, res) => {
    const {_id, name, businessName, panNumber, district, area, phoneNumber } = req.body;



    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            _id,
            { name, businessName, panNumber, district, area, phoneNumber },
            { new: true }
        );


        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json({ message: 'Customer updated successfully', updatedCustomer });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating customer', error });
    }
};

export const deleteCustomerController = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(id);
        if (!deletedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        return res.status(200).json({ message: 'Customer deleted successfully', deletedCustomer });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting customer', error });
    }
};

export const getCustomerController = async (req, res) => {
    try {
        const customers = await Customer.find();   
        return res.status(200).json(customers);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching customers', error });
    }
}