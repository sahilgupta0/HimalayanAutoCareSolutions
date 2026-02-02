import User from '../Models/userModel.js';

import Sale from '../Models/salesModel.js';
import jwt from 'jsonwebtoken';


export const loginController = async (req, res) => {
    // Logic for handling user login
    console.log('Login attempt with body:', req.body);
    const {email, password} = req.body;

    const user = await User.findOne({email, password});
    console.log('Found user:', user);
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }   

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
        message: 'Login successful',
        user,
        token
    });
    
}

export const signupController = async (req, res) => {
    // Logic for handling user signup
    const {name, email, password, role} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message: 'User already exists'});
    }
    const newUser = new User({name, email, password, role});
    await newUser.save();
    return res.status(201).json({message: 'User created successfully', newUser});
}

export const allUsersController = async (req, res) => {
    try {
        // console.log("Fetching all users");
        const users = await User.find();
        const filteredUsers = users.map(item => ({
            _id: item._id,
            name: item.name,
            email: item.email,
            role: item.role
        }));
        // console.log(filteredUsers);
        return res.status(200).json(filteredUsers);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error });
    }
}

export const getSalesController = async (req, res) => {
    // Logic for fetching sales data
    try {
        const sales = await Sale.find();    
        return res.status(200).json(sales);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching sales', error });
    }
}

export const createSalesController = async (req, res) => {
    // Logic for creating a new sales record
    const { productName, quantity, subTotal, discount, totalPrice, customerId, salesPersonId } = req.body;
    // Here you would typically save the sales record to the database
    const newSale = new Sale({ productName, quantity, subTotal, discount, totalPrice, customerId, salesPersonId });
    await newSale.save();
    return res.status(201).json({ message: 'Sales record created successfully', newSale });
}

export const getPersonalSalesController = async (req, res) => {
    // Logic for fetching personal sales data
    const { salesPersonId } = req.query;
    try {
        const sales = await Sale.find({ salesPersonId });    
        return res.status(200).json(sales);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching personal sales', error });
    }   
}  

