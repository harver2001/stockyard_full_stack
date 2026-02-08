import mongoose from 'mongoose';

const potfolioSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    stockSymbols: {
        
    }
})