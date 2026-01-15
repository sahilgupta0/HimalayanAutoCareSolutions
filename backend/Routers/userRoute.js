import express from 'express';
import  {loginController, signupController, createCustomerController, getCustomerController}  from '../Controllers/userController.js';
import { get } from 'mongoose';


const router = express.Router();


// Example route: Get user profile
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/createCustomer', createCustomerController);
router.get('/customers',getCustomerController);

export default router;  