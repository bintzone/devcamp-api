const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const erroHandler = require('./middleWare/error');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
dotenv.config({ path: './config/config.env' });
connectDB();
const bootcamp = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const app = express();
// body parser
app.use(express.json());
app.use(cookieParser());
// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// file upload
app.use(fileupload());
//sanitize data
app.use(mongoSanitize());
// set secuirerty hedders
app.use(helmet());
// prevent xss attacks
app.use(xss());
// rate limitting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10ms
  max: 100,
});
app.use(limiter);
// prevent hpp param pollution
app.use(hpp());
// enable cors
app.use(cors());
// set stati folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use(erroHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `server running ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
process.on('unhandledRejection', (err, Promise) => {
  console.log(`ERROR: ${err.message}`);
  server.close(() => process.exit(1));
});
