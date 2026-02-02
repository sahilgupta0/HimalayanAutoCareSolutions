
import express from "express";
import { createCustomerController , getCustomerController} from "../Controllers/customerController.js";


const router = express.Router();

router.post('/createCustomer', createCustomerController);
router.get('/getCustomer',getCustomerController);

export default router;