//Creating an global catch to our async functions, instead of the try{}catch(){} that we repeat everytime:
//we create a function that receive another function (like our createTour), and we catch the error,
//if there is no error, we call the method next() and the program continues

module.exports = (fn) => (req, res, next) => {
  //we will run the code that before was inside of the try block, and if there is an error,
  //we willl pass the error to our next(), so it will go directly to our errorController
  fn(req, res, next).catch((err) => next(err));
};
