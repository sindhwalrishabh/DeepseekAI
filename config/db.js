
import mongoose from "mongoose";

const cached = global.mongoose || {
    conn: null,
    promise: null,
};

global.mongoose = cached;

export default async function connectDB() {
    if (cached.conn) {
        console.log("Using existing MongoDB connection");
        return cached.conn;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI)
            .then((mongoose) => {
                console.log("MongoDB connected successfully");
                return mongoose;
            })
            .catch((error) => {
                cached.promise = null;
                throw error;
            });
    }

    cached.conn = await cached.promise;

    return cached.conn;
}
