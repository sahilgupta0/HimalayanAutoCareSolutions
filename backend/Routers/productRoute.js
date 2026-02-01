
import express from "express";
import { createOrUpdateProductController , getProductController} from "../Controllers/productController.js";


const router = express.Router();

router.post('/createProduct', createOrUpdateProductController);
router.get('/products', getProductController);

export default router;