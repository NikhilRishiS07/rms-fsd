const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const Resource = require('./models/Resource');
const Booking = require('./models/Booking');
const UsedBy = require('./models/UsedBy'); // Optional, but included for completeness

const app = express();
app.use(cors());
app.use(express.json());

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/rms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(console.error);

// -- LOGIN --
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.pwd_hash !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const userData = user.toObject();
    delete userData.pwd_hash;
    res.json({ token: 'demo', user: userData });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// -- LIST AVAILABLE RESOURCES --
app.get('/api/resources', async (_req, res) => {
  try {
    const resources = await Resource.find({ status: 'Available' }).sort({ name: 1 });
    res.json(resources);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// -- CREATE A BOOKING --
app.post('/api/bookings', async (req, res) => {
  const { resource_id, user_id, start_time, end_time } = req.body;
  try {
    const resource = await Resource.findById(resource_id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Optionally link in UsedBy collection if you’re using it
    await UsedBy.findOneAndUpdate(
      { user: user_id, resource: resource_id },
      { user: user_id, resource: resource_id },
      { upsert: true }
    );

    // Only allow booking if resource is available
    const status = resource.status === 'Available' ? 'Booked' : 'Unavailable';

    const booking = new Booking({
      resource: resource_id,
      user: user_id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status,
    });

    const savedBooking = await booking.save();
    res.json({ id: savedBooking._id, status });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// -- ADD A NEW RESOURCE --
app.post('/api/resources', async (req, res) => {
  const { name, status = 'Available', capacity, availability_start, availability_end, equipment = '', location } = req.body;
  try {
    const resource = new Resource({
      name,
      status,
      capacity,
      availability_start,
      availability_end,
      equipment,
      location
    });
    const saved = await resource.save();
    res.json({ id: saved._id, message: 'resource added' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// -- GET RESOURCES WITH BOOKINGS (FOR SEARCH) --
app.get('/api/resources-with-bookings', async (_req, res) => {
  try {
    // Get all resources
    const resources = await Resource.find().sort({ name: 1 }).lean();

    // Collect all resource-booking pairs
    const result = await Promise.all(resources.map(async r => {
      const bookings = await Booking.find({ resource: r._id, status: 'Booked' })
        .populate('user', 'name email')
        .lean();

      // If no booking, provide blank/empty booking object for display
      if (bookings.length === 0) {
        return [{
          resource_id: r._id,
          name: r.name,
          location: r.location,
          capacity: r.capacity,
          base_status: r.status,
          used_by_user_id: null,
          used_by_name: null,
          used_by_email: null,
          booking_id: null,
          start_time: null,
          end_time: null,
        }];
      }

      // Otherwise map all bookings with populated user info
      return bookings.map(b => ({
        resource_id: r._id,
        name: r.name,
        location: r.location,
        capacity: r.capacity,
        base_status: r.status,
        used_by_user_id: b.user ? b.user._id : null,
        used_by_name: b.user ? b.user.name : null,
        used_by_email: b.user ? b.user.email : null,
        booking_id: b._id,
        start_time: b.start_time,
        end_time: b.end_time,
      }));
    }));

    res.json(result.flat());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// -- LIST MY BOOKINGS --
app.get('/api/mybookings/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  try {
    const bookings = await Booking.find({ user: userId })
      .populate('resource', 'name location')
      .sort({ start_time: -1 })
      .lean();

    const resp = bookings.map(b => ({
      booking_id: b._id,
      start_time: b.start_time,
      end_time: b.end_time,
      booking_status: b.status,
      resource_id: b.resource._id,
      resource_name: b.resource.name,
      location: b.resource.location,
    }));
    res.json(resp);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
