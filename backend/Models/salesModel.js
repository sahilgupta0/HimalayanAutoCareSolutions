import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
    saleDate: { type: Date, default: Date.now },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status : { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    salesPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;