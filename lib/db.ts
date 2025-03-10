import mongoose from "mongoose";

const ConnectMongoDB = async() =>{
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection failed', error);
  }
}


export default ConnectMongoDB;