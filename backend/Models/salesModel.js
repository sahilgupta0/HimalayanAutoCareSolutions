import mongoose from 'mongoose';



const salesSchema = new mongoose.Schema({
    saleDate: { type: Date, default: Date.now },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            productName: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            total: { type: Number, required: true }
        }
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status : { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    salesPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;