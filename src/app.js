// src/app.js

const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const contractsRoute = require('./routes/contractHandler');
const jobsRoute = require('./routes/jobHandler');
const balanceRoute = require('./routes/balanceHandler');
const adminRoute = require('./routes/admdinHandler');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize); // Set Sequelize instance in app
app.set('models', sequelize.models); // Set models in app

// Set up routes
app.use('/contracts', contractsRoute); // Use contracts route
app.use('/jobs', jobsRoute);
app.use('/balances', balanceRoute);
app.use('/admin', adminRoute);


// Export app for starting the server
module.exports = app;
