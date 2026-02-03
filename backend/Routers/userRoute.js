import express from 'express';
import  {loginController, signupController, allUsersController}  from '../Controllers/userController.js';


const router = express.Router();


// Example route: Get user profile
router.post('/login', loginController);
router.post('/signup', signupController);
router.get('/fetchAllUsers', allUsersController);

export default router;