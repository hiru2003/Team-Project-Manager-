const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const wipe = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('🗑️  Wiping PROJECCTS...');
    await mongoose.connection.collection('projects').deleteMany({});
    
    console.log('🗑️  Wiping TASKS...');
    await mongoose.connection.collection('tasks').deleteMany({});

    console.log('✅ DATABASE CLEANED SUCCESSFULLY.');
    console.log('You can now start fresh with actual Projects and Tasks.');
    process.exit(0);
  } catch (error) {
    console.error('Error wiping database:', error);
    process.exit(1);
  }
};

wipe();
