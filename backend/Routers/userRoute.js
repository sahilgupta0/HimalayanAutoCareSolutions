import express from 'express';
import  {loginController, signupController, getSalesController, createSalesController, getPersonalSalesController, allUsersController}  from '../Controllers/userController.js';
import { get } from 'mongoose';


const router = express.Router();


// Example route: Get user profile
router.post('/login', loginController);
router.post('/signup', signupController);
router.get('/fetchAllUsers', allUsersController);

router.get('/sales', getSalesController);
router.post('/request',createSalesController);
router.get('/requests',getPersonalSalesController);

export default router;