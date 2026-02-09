import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
    },
})

const potfolioSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    stocks: {
        type: [StockSchema],
        required: true,
    }
})

const Portfolio = mongoose.model('Potfolio', potfolioSchema)
