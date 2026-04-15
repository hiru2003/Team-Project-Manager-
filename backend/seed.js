const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Task = require('./models/Task');

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Wiping existing data...');

    // Wipe DB
    await User.deleteMany();
    await Workspace.deleteMany();
    await Task.deleteMany();

    console.log('Creating Admin User...');
    // Create User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@nexus.com',
      password: 'password123',
      role: 'Admin',
      isVerified: true
    });

    console.log('Deploying Workspace...');
    // Create Workspace
    const workspace = await Workspace.create({
      name: 'Nexus-Flow Team Workspace',
      description: 'The core operational database workspace.',
      owner: adminUser._id,
      members: [
        {
          user: adminUser._id,
          role: 'Admin'
        }
      ]
    });

    console.log('================================================');
    console.log('SUCCESS! MongoDB Atlas Environment Cleaned.');
    console.log('Admin Account: admin@nexus.com / password123');
    console.log('Next: Log in and create your first real project!');
    console.log('================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error Seeding Database:', error);
    process.exit(1);
  }
};

seedDB();
