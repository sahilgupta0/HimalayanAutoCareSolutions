
import express from 'express';
import { getAllSalesController, createSalesController, getPersonalSalesController } from '../Controllers/salesController.js';


const router = express.Router();

router.get('/all-sales', getAllSalesController);

router.post('/createSale',createSalesController);

router.get('/personal-sales/:salesPersonId', getPersonalSalesController);


export default router;
