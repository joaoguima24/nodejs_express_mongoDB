const express = require('express');

const app = express();

app.get('/', (req, res) => {
  //send message
  //res.status(200).send('Hello World!');
  res.status(200).json({ message: 'Helllo World!' });
});

app.post('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to our world' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
