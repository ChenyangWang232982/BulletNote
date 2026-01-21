require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

// initialize application
const app = express();
const PORT = process.env.PORT || 5000;

//connect database
connectDB();

// middlewear
app.use(cors()); 
app.use(express.json()); 

//router
app.use('/api/notes', noteRoutes);

// route testing
app.get('/', (req, res) => {
  res.send(' Bullet Note backend is running');
});

// launch
app.listen(PORT, () => {
  console.log(`🚀 running on http://localhost:${PORT}`);
});