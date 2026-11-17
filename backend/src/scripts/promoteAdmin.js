require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDatabase } = require('../config/database');

async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('Set ADMIN_EMAIL to the existing account email before running this command.');
  try {
    await connectDatabase();
    const user = await User.findOneAndUpdate({ email }, { $set: { role: 'admin', isActive: true } }, { new: true }).select('name email role');
    if (!user) throw new Error('No account exists for ADMIN_EMAIL. Register that account first.');
    console.info(`Administrator role enabled for ${user.email}.`);
  } finally {
    await mongoose.disconnect();
  }
}

promoteAdmin().catch((error) => {
  console.error('Unable to promote administrator:', error.message);
  process.exitCode = 1;
});
