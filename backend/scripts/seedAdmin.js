// scripts/seedAdmin.js
// Script to create first admin user
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/db');
require('dotenv').config();

const createFirstAdmin = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }
    
    // Create admin user (you'll need to manually set the clerkId after the user signs up via Clerk)
    // This script is mainly for reference - you should promote a user to admin after they register
    
    console.log('To create an admin user:');
    console.log('1. Register a user through your frontend');
    console.log('2. Get their MongoDB _id');
    console.log('3. Run the following MongoDB command:');
    console.log('   db.users.updateOne({_id: ObjectId("USER_ID")}, {$set: {role: "admin"}})');
    console.log('4. Or use the promote endpoint from another admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

// Alternative: Promote existing user to admin by email
const promoteUserToAdmin = async (email) => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        role: 'admin',
        status: 'active'
      },
      { new: true }
    );
    
    if (!user) {
      console.log('User not found with email:', email);
      process.exit(1);
    }
    
    console.log('User promoted to admin successfully:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (email) {
  promoteUserToAdmin(email);
} else {
  createFirstAdmin();
}

// Usage:
// node scripts/seedAdmin.js
// or
// node scripts/seedAdmin.js user@example.com