const express = require('express');
const { errorHandler } = require('./middlewares/errorHandler');
const cors = require('cors');
require('express-async-errors');
require("dotenv").config();
require("./db");
const userRouter = require('./routes/user');
const brandRouter = require('./routes/brand');
const shopRouter = require('./routes/shop');
const reviewRouter = require('./routes/review');
const { handleNotFound } = require('./utils/helper');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/brand', brandRouter);
app.use('/api/review', reviewRouter);
app.use('/api/shop', shopRouter);
app.use('/*', handleNotFound);
app.use(errorHandler);


app.listen(8000, () => {
    console.log('The port is listening to port 8000')
});