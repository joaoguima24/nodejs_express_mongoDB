class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //Create another object equal to req.query
    //so we can mannipulate it and don't mannipulate the req object
    const queryObj = { ...this.queryString };
    //Creating an array of fields that we want to exclude from the query params search
    //Because we wan't them to another search result
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    //excluding that fields from the queryObj
    excludeFields.forEach((elem) => delete queryObj[elem]);
    //passing a filter to our methor find(), with the query params object
    //adding an advanced filter to search >= / <= for example
    // the object query that we receive is for example: {duration: {gte:5}}
    //but the object that we need is: {duration: {$gte:5}}
    let queryStr = JSON.stringify(queryObj);
    //replacing with regex the : gte, gt , lte, lt:
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //if we are trying to sort: (and sort by more than 1 parameter)
    if (this.queryString.sort) {
      //we receive a query like : sort('price',ratingsAverage)
      //but we want a query with no ","" but instead a " "
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    //Field limiting , like in sort we have to replace "," for " " in query params
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //pagination:
    //we can get querys like for example: page=2&limit=10
    //so the query for mongo will be: query = query.skip(2).limit(10);
    //The result: page1: 1-10, page2: 11-20 ...
    // we have to calculate the skip , because it's not user friendly to ask for the skip to user
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
