import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Config/db.js';
import user from './Routers/userRoute.js';
import customer from './Routers/customerRoute.js';
import product from './Routers/productRoute.js';


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));


// Connect to MongoDB
connectDB();


app.use('/api/user', user);
app.use('/api/customer', customer);
app.use('/api/product', product);



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);
});
