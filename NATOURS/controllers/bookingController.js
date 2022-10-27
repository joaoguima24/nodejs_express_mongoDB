const handlerFactory = require('../utils/handlerFactory');
const Booking = require('../models/bookingsModel');

exports.createBooking = handlerFactory.createOne(Booking);
exports.getBooking = handlerFactory.getOne(Booking);
exports.getAllBooking = handlerFactory.getAll(Booking);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);
