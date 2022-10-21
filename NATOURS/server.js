const dotenv = require('dotenv');

//Importing mongoose framework
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

//Creating the string to connect to DB (replacing the password)
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Connecting to the db
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => console.log('MongoDB connected !'));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
