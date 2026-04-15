const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Workspace = require('../models/Workspace');

const cleanRoles = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('🛠️  Demoting any existing "Manager" users to "Member"...');
    const userResult = await User.updateMany(
      { role: 'Manager' },
      { $set: { role: 'Member' } }
    );
    console.log(`Updated ${userResult.modifiedCount} users.`);

    console.log('🛠️  Cleaning up Workspace memberships...');
    // We update the members array inside workspaces
    const workspaceResult = await Workspace.updateMany(
      { "members.role": "Manager" },
      { $set: { "members.$[elem].role": "Member" } },
      { arrayFilters: [{ "elem.role": "Manager" }] }
    );
    console.log(`Updated roles in ${workspaceResult.modifiedCount} workspaces.`);

    console.log('✅ ROLE CLEANUP COMPLETE.');
    process.exit(0);
  } catch (error) {
    console.error('Error during role cleanup:', error);
    process.exit(1);
  }
};

cleanRoles();
