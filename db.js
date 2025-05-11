import mongoose from "mongoose";

// Connect to MongoDB
export async function connect() {
    await mongoose.connect('mongodb://127.0.0.1:27017/p2p_crypto_lender_db')
    console.log(mongoose.connection.readyState == 1 ? "Connected to MongoDB" : "Failed to connect to MongoDB")
}

// Disconnect from MongoDB
export async function disconnect() {
    await mongoose.connection.close()
    console.log(mongoose.connection.readyState == 0 ? "Disconnected from MongoDB" : "Failed to disconnect from MongoDB")
}