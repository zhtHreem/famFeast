import mongoose from 'mongoose';
import dns from 'dns';
import 'dotenv/config';

// Some networks/ISPs block SRV lookups used by mongodb+srv:// URIs.
// Set DNS_SERVERS=8.8.8.8,1.1.1.1 in .env to work around that.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
    await mongoose.connect(process.env.MONGO_URI, process.env.MONGO_DB_NAME ? { dbName: process.env.MONGO_DB_NAME } : {});
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
