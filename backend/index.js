import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Config/db.js';
import user from './Routers/userRoute.js';


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



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);
});
