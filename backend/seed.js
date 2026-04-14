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

    console.log('Creating Nexus Workspace...');
    // Create Workspace
    const workspace = await Workspace.create({
      name: 'Nexus Primary Workspace',
      description: 'The core operational database workspace.',
      owner: adminUser._id,
      members: [
        {
          user: adminUser._id,
          role: 'Admin'
        }
      ]
    });

    console.log('Deploying Mock Tasks...');
    // Create Tasks
    await Task.create([
      { title: 'Finish MongoDB Integration', description: 'Fully link the frontend application to the new MongoDB Atlas cluster setup.', status: 'In Progress', workspaceId: workspace._id, assignedTo: adminUser._id },
      { title: 'Design Component Library', description: 'Create beautiful glassmorphism assets in Tailwind v4.', status: 'Done', workspaceId: workspace._id, assignedTo: adminUser._id },
      { title: 'Write Auth Middleware tests', description: 'Ensure the auth fallback correctly prevents 401 unhandled exceptions via Next.', status: 'Done', workspaceId: workspace._id, assignedTo: adminUser._id },
      { title: 'Add real Avatar logic', description: 'Replace the hardcoded avatars with randomized initials from user profiles.', status: 'To Do', workspaceId: workspace._id, assignedTo: adminUser._id },
      { title: 'Deploy to Vercel/Render', description: 'Host the finalized application so the public can access it.', status: 'To Do', workspaceId: workspace._id, assignedTo: adminUser._id },
    ]);

    console.log('================================================');
    console.log('SUCCESS! MongoDB Atlas Pipeline configured and seeded.');
    console.log('Login Email: admin@nexus.com');
    console.log('Login Password: password123');
    console.log('================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error Seeding Database:', error);
    process.exit(1);
  }
};

seedDB();
