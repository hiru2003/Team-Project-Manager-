const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');

const MASTER_NAME = 'Nexus-Flow Team Workspace';
const OLD_NAMES = ['Primary Team Workspace', 'Nexus Primary Workspace'];

const unify = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Ensure the MASTER workspace exists or create it
    let masterWorkspace = await Workspace.findOne({ name: MASTER_NAME });
    if (!masterWorkspace) {
      console.log(`Creating Master Workspace: ${MASTER_NAME}...`);
      const anyAdmin = await User.findOne({ role: 'Admin' });
      if (!anyAdmin) {
        console.error('❌ No Admin user found. Please run seed.js first or register an Admin.');
        process.exit(1);
      }
      masterWorkspace = await Workspace.create({
        name: MASTER_NAME,
        description: 'The unified shared workspace for the entire team.',
        owner: anyAdmin._id,
        members: [{ user: anyAdmin._id, role: 'Admin' }]
      });
    }

    console.log(`Master Workspace ID: ${masterWorkspace._id}`);

    // 2. Find legacy workspaces
    const legacyWorkspaces = await Workspace.find({ 
      name: { $in: OLD_NAMES }, 
      _id: { $ne: masterWorkspace._id } 
    });

    console.log(`Found ${legacyWorkspaces.length} legacy workspaces to merge.`);

    for (const legacy of legacyWorkspaces) {
      console.log(`\nMerging [${legacy.name}] (${legacy._id}) -> [${MASTER_NAME}]`);

      // 3. Move Projects
      const projectResult = await Project.updateMany(
        { workspaceId: legacy._id },
        { $set: { workspaceId: masterWorkspace._id } }
      );
      console.log(` - Moved ${projectResult.modifiedCount} projects.`);

      // 4. Move Tasks
      const taskResult = await Task.updateMany(
        { workspaceId: legacy._id },
        { $set: { workspaceId: masterWorkspace._id } }
      );
      console.log(` - Moved ${taskResult.modifiedCount} tasks.`);

      // 5. Merge Members
      for (const member of legacy.members) {
        const alreadyInMaster = masterWorkspace.members.some(
          m => m.user.toString() === member.user.toString()
        );
        if (!alreadyInMaster) {
          masterWorkspace.members.push(member);
        }
      }
      
      // 6. Delete legacy
      await Workspace.deleteOne({ _id: legacy._id });
      console.log(` - Deleted legacy workspace document.`);
    }

    // Save final master workspace with all members
    await masterWorkspace.save();

    // 7. Ensure EVERY user is in the master workspace (extra safety)
    const allUsers = await User.find({});
    let addedCount = 0;
    for (const user of allUsers) {
      const isMember = masterWorkspace.members.some(
        m => m.user.toString() === user._id.toString()
      );
      if (!isMember) {
        masterWorkspace.members.push({ user: user._id, role: user.role || 'Member' });
        addedCount++;
      }
    }
    await masterWorkspace.save();
    console.log(`\n✅ Final Sync: Added ${addedCount} missing users to Master.`);

    console.log('\n🎉 ALL WORKSPACES UNIFIED SUCCESSFULLY!');
    console.log(`Everyone is now under: "${MASTER_NAME}"`);
    process.exit(0);
  } catch (error) {
    console.error('Unification Error:', error);
    process.exit(1);
  }
};

unify();
