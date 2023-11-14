const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://pradeep:kongu2004@cluster1.y5ght6n.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

const User = mongoose.model('User', {
  email: String,
  password: String,
});

// Sign Up Route
app.post('/api/signup', async (req, res) => {
  try {
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create a new user
    const user = new User({
      email: req.body.email,
      password: req.body.password,
    });

    // Save the new user
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sign In Route
app.post('/api/signin', async (req, res) => {
  try {
    // Find the user with the provided email and password
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (user) {
      // User found, send a success response
      return res.status(200).json({ message: 'Sign-in successful' });
    } else {
      // User not found or password doesn't match, send an error response
      return res.status(401).json({ error: 'Sign-in failed. Check your credentials.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
