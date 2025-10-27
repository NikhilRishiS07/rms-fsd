const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');
const UsedBy = require('./models/UsedBy');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://localhost:27017/rms', { useNewUrlParser: true, useUnifiedTopology: true });

async function seed() {
  await User.deleteMany({});
  await Resource.deleteMany({});
  await UsedBy.deleteMany({});
  await Booking.deleteMany({});

  // Users
  const users = await User.insertMany([
    { name: 'Alice Johnson', email: 'alice@example.com', pwd_hash: '123', role: 'Admin' },
    { name: 'Bob Smith',     email: 'bob@example.com',   pwd_hash: '123', role: 'Faculty' },
    { name: 'Carol Lee',     email: 'carol@example.com', pwd_hash: '123', role: 'Staff' },
    { name: 'David Kim',     email: 'david@example.com', pwd_hash: '123', role: 'Student' }
  ]);

  // Resources
  const resources = await Resource.insertMany([
    { name: 'Lecture Hall 101', status: 'Available', capacity: 100, availability_start: '08:00:00', availability_end: '18:00:00', equipment: 'Projector, Sound System', location: 'Building A' },
    { name: 'Computer Lab 203', status: 'Available', capacity: 30,  availability_start: '09:00:00', availability_end: '17:00:00', equipment: 'Computers, Printers', location: 'Building B' },
    { name: 'Conference Room 1', status: 'Unavailable', capacity: 50, availability_start: '08:30:00', availability_end: '16:30:00', equipment: 'Video Conferencing', location: 'Building C' }
  ]);

  // Used_By
  await UsedBy.insertMany([
    { user: users[0]._id, resource: resources[0]._id },
    { user: users[1]._id, resource: resources[1]._id },
    { user: users[2]._id, resource: resources[1]._id },
    { user: users[3]._id, resource: resources[0]._id }
  ]);

  // Bookings
  await Booking.insertMany([
    { start_time: new Date('2025-10-23T09:00:00'), end_time: new Date('2025-10-23T11:00:00'), user: users[0]._id, resource: resources[0]._id, status: 'Booked' },
    { start_time: new Date('2025-10-23T13:00:00'), end_time: new Date('2025-10-23T15:00:00'), user: users[1]._id, resource: resources[1]._id, status: 'Booked' },
    { start_time: new Date('2025-10-24T10:00:00'), end_time: new Date('2025-10-24T12:00:00'), user: users[3]._id, resource: resources[0]._id, status: 'Cancelled' }
  ]);

  console.log('Seeding done!');
  mongoose.disconnect();
}

seed();
