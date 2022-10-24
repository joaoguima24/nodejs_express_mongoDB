const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Leading with uncaughtException , like when we try to access to somethig that is not declared
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);

  process.exit(1);
});

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

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//Leading with unhandle Rejection , like if the connection to our db doesn't work:
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
