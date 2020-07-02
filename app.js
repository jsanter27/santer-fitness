const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const graphqlHTTP = require('express-graphql');
const bluebird = require('bluebird');

require('dotenv').config();

const schema = require('./graphql/Schema');

mongoose.connect(process.env.MONGO_URL, { promiseLibrary: bluebird, useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Successfully connected to database...'))
    .catch((err) => console.error(err));

const app = express();

app.get('env');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');


app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

if (process.env.NODE_ENV === 'production'){
    app.use(express.static('./client/build'));
}

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('*', cors());

app.use('/graphql', cors(), graphqlHTTP({
    schema: schema,
    rootValue: global,
    graphiql: process.env.NODE_ENV === 'development'
}));

app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

