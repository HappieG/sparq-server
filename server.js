// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const mdb_url = process.env.MONGODB_URI;
console.log("url:"+ mdb_url);

app.use(cors());

// Connect to MongoDB
mongoose.connect(mdb_url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Create a schema for the registration data
const registrationSchema = new mongoose.Schema({
    company : String,
    phone: String,
    password: String,
    url2: String,
    url1: String,
    customDash: Boolean
});

// registrationSchema.pre('save', function (next) {
// //   const currentDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
// //   this.registrationTime = currentDate;
//   next();
// });


const Registration = mongoose.model('vendorData', registrationSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/health', async (req, res) => {
  console.log('Health api:', req.headers);

    res.status(200).send('healthy!!!');
});

//Admin Login Validation

app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
  const { company, phone, password, url2 ,url1 } = req.body;
  const customDash = false;

  if (company.length != 0 && phone.length != 0 && password.length != 0) {
    const newRegistration = new Registration({
        company,
        password,
        phone,
        customDash,
        url2,
        url1
      });
  
      await newRegistration.save();
      console.log('Data saved to MongoDB');
      res.status(200).send('Registration successful');
  } else {
    res.json({ success: false, message: "data not entered succesfully" });
  }
});


app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
  
    try {
      // Find a user with the provided phone and password
      const user = await Registration.findOne({ phone, password });
  
      if (user) {
        // User exists, login successful
        res.status(200).json({ success: true, message: "Login successful", user });
      } else {
        // User not found, login failed
        res.status(401).json({ success: false, message: "Invalid phone or password" });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  



  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });


  // Export the app as a Cloud Function
module.exports = app;
