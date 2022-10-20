const express = require('express');
const morgan = require('morgan');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middleware
app.use(morgan('dev'));
app.use(express.json());

//giving the tourRouter the main rout
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
