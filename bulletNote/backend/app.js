require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const cookieParser = require('cookie-parser');
const swaggerDocument = require('./swagger_output.json');
const swaggerUi = require('swagger-ui-express');


if (process.env.NODE_ENV !== "development") {
  console.log = () => {};          
  console.debug = () => {};        
}
// initialize application
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());                     
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
const origin = process.env.NODE_ENV === 'production' ? 'https://bullet-note-nn6jiqh5f-chenyangwang232982s-projects.vercel.app' : 'http://localhost:5173';
// middlewear
app.use(cors({
  origin: origin,
  credentials: true, //Allowed to cross origin with cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Skip-Alert']
})); 

app.use((req, res, next) => {
  if (process.env.Request == 1) {console.log(`【Global request log】${req.method} ${req.url} - body:`, req.body);}
  next();
});
//connect database
connectDB();

//router
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//error handle
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

// route testing
app.get('/', (req, res) => {
  res.send(' Bullet Note backend is running');
});

// launch
app.listen(PORT, () => {
  console.log(`🚀 running on http://localhost:${PORT}`);
});