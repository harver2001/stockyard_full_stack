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

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    stocks: {
        type: [StockSchema],
        required: true,
    }
})

const Portfolio = mongoose.model('Portfolio', portfolioSchema)

export default Portfolio;
