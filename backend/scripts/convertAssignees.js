const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Task = require('../models/Task');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Find tasks where assignedTo is NOT an array
    // MongoDB $type: "array" checks for array types
    const tasks = await Task.find({ assignedTo: { $not: { $type: "array" } } });
    
    console.log(`Found ${tasks.length} legacy tasks to migrate.`);

    let migratedCount = 0;
    for (const task of tasks) {
      if (task.assignedTo) {
        // Wrap the single ID in an array
        const singleId = task.assignedTo;
        task.assignedTo = [singleId];
        await task.save();
        migratedCount++;
      } else {
        // If it was null/undefined, set to empty array or just ignore
        task.assignedTo = [];
        await task.save();
        migratedCount++;
      }
    }

    console.log(`✅ Successfully migrated ${migratedCount} tasks to the multiple assignee format.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
};

migrate();
