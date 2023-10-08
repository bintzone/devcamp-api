const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(
    `mongoDB connect: ${(await conn).connection.host}`.cyan.underline.bold
  );
};

module.exports = connectDB;
