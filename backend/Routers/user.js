import express from 'express';
import  {loginController, signupController}  from '../Controllers/userController.js';


const router = express.Router();


// Example route: Get user profile
router.post('/user/login', loginController);
router.post('/user/signup', signupController);

export default router;  