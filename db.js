import mongoose from "mongoose";

// Connect to MongoDB
export async function connect() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log(mongoose.connection.readyState == 1 ? "Connected to MongoDB" : "Failed to connect to MongoDB")
}

// Disconnect from MongoDB
export async function disconnect() {
    await mongoose.connection.close()
    console.log(mongoose.connection.readyState == 0 ? "Disconnected from MongoDB" : "Failed to disconnect from MongoDB")
}

export default { connect, disconnect }