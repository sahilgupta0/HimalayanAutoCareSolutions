import mongoose from "mongoose";


const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    businessName: { type: String, required: true },
    panNumber: { type: String, required: true },
    area: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }

}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;