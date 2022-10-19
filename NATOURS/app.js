const fs = require('fs');
const express = require('express');

const app = express();

//middleware
app.use(express.json());

//we are getting the tours from the json file with (fs)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    //we should pass the status and the number of results in the json data
    status: 'success',
    results: tours.length,
    //then we give the data
    data: {
      //because the key and the value has the same name, we can just give the value
      tours,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  //giving a new id (just because we are faking the DB)
  const newId = tours[tours.length - 1].id + 1;
  //assign the id to the request body
  const newTour = Object.assign({ id: newId }, req.body);
  // push the new tour to the fake db
  tours.push(newTour);
  //overwrite the fake db

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: newTour,
      });
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
