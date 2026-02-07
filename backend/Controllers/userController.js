import User from '../Models/userModel.js';

import jwt from 'jsonwebtoken';


export const loginController = async (req, res) => {
    // Logic for handling user login
    const {email, password} = req.body;

    const user = await User.findOne({email, password});
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
        const users = await User.find();
        const filteredUsers = users.map(item => ({
            _id: item._id,
            name: item.name,
            email: item.email,
            role: item.role
        }));
        return res.status(200).json(filteredUsers);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error });
    }
}


