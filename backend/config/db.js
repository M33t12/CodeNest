// config/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Connect to MongoDB with enhanced configuration
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<void>}
 */
const connectDB = async (uri) => {
  try {
    // Validate URI
    if (!uri) {
      throw new Error('MongoDB URI is required');
    }

    // Connection options for better performance and reliability
    const options = {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      // bufferMaxEntries: 0, // Disable mongoose buffering
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(uri, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`Connection State: ${getConnectionState(conn.connection.readyState)}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful close on app termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during MongoDB disconnection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    // Enhanced error handling
    if (error.name === 'MongoNetworkError') {
      console.error('Network error - check your MongoDB server and connection');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('Server selection error - MongoDB server may be down');
    } else if (error.message.includes('authentication failed')) {
      console.error('Authentication error - check your username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('DNS error - check your MongoDB host address');
    }
    
    console.error('Full error details:', error);
    process.exit(1);
  }
};

/**
 * Get human-readable connection state
 * @param {number} state - Mongoose connection state number
 * @returns {string} Human-readable state
 */
const getConnectionState = (state) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
};

/**
 * Get current database connection status
 * @returns {Object} Connection status information
 */
const getConnectionStatus = () => {
  const connection = mongoose.connection;
  return {
    state: getConnectionState(connection.readyState),
    host: connection.host,
    name: connection.name,
    port: connection.port,
    readyState: connection.readyState,
    collections: Object.keys(connection.collections).length
  };
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Check if database is connected
 * @returns {boolean} Connection status
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Wait for database connection to be ready
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<boolean>} True if connected within timeout
 */
const waitForConnection = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    if (isConnected()) {
      resolve(true);
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('Database connection timeout'));
    }, timeout);

    mongoose.connection.once('connected', () => {
      clearTimeout(timer);
      resolve(true);
    });

    mongoose.connection.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  isConnected,
  waitForConnection,
  getConnectionState
};