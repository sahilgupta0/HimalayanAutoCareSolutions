



export const createCustomerController = async (req, res) => {
    // Logic for creating a new customer
    const {name, businessName, panNumber, area, phoneNumber} = req.body;
    // Here you would typically save the customer to the database
    const newCustomer = new Customer({name, businessName, panNumber, area, phoneNumber});
    await newCustomer.save();
    return res.status(201).json({message: 'Customer created successfully', newCustomer});
    
}


export const getCustomerController = async (req, res) => {
    try {
        const customers = await Customer.find();   
        return res.status(200).json(customers);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching customers', error });
    }
}