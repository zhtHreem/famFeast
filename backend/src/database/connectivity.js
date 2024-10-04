import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); 

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI; 

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
