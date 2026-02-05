
import express from 'express';
import { getAllSalesController, createSalesController, getPersonalSalesController, acceptSaleController } from '../Controllers/salesController.js';


const router = express.Router();

router.get('/all-sales', getAllSalesController);

router.post('/createSale',createSalesController);

router.get('/personal-sales/:salesPersonId', getPersonalSalesController);

router.post('/accept-sale/:saleId', acceptSaleController);


export default router;
