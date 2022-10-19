const fs = require('fs');
const express = require('express');

const app = express();

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

app.post('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to our world' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
