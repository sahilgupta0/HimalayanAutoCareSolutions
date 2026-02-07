
import express from "express";
import { createCustomerController , getCustomerController, updateCustomerController, deleteCustomerController} from "../Controllers/customerController.js";


const router = express.Router();

router.post('/createCustomer', createCustomerController);
router.get('/getCustomer',getCustomerController);
router.put('/updateCustomer', updateCustomerController);
router.delete('/deleteCustomer/:id', deleteCustomerController);

export default router;