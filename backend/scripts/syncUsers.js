const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Workspace = require('../models/Workspace');

const sync = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Find the Primary Workspace
    const workspace = await Workspace.findOne({ name: 'Nexus-Flow Team Workspace' });
    if (!workspace) {
      console.error('❌ Primary Team Workspace not found. Please register an Admin first.');
      process.exit(1);
    }

    // 2. Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} total users.`);

    // 3. Ensure every user is in the members list
    let addedCount = 0;
    for (const user of users) {
      const isMember = workspace.members.some(m => m.user.toString() === user._id.toString());
      
      if (!isMember) {
        workspace.members.push({ user: user._id, role: user.role || 'Member' });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await workspace.save();
      console.log(`✅ Successfully added ${addedCount} users to the shared workspace.`);
    } else {
      console.log('ℹ️ All users are already members.');
    }

    console.log('🎉 SYNC COMPLETE. All users should now see the shared projects.');
    process.exit(0);
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
};

sync();
