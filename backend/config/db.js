const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {

        const uri = process.env.MONGO_URI ||process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('✅ HomePhysio MongoDB Connected — DB:', mongoose.connection.db.databaseName);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;