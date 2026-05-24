const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackersafe';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[DATABASE] MongoDB connection error: ${error.message}`);
      process.exit(1);
    }

    console.warn(
      `[DATABASE] Local MongoDB unavailable (${error.message}). Starting in-memory database for development...`
    );

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { launchTimeout: 120000 },
      });
      const memoryUri = memoryServer.getUri('hackersafe');
      const conn = await mongoose.connect(memoryUri);
      console.log(`[DATABASE] In-memory MongoDB ready at ${conn.connection.host}`);
    } catch (memoryError) {
      console.error(`[DATABASE] Failed to start in-memory MongoDB: ${memoryError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
