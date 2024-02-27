'use strict';

require('dotenv').config();
const {start} = require('./src/server');
const {db} = require('./src/models');
const PORT = process.env.PORT || 5400;

// { force: true }

db.sync().then(()=>{
  start(PORT);
}).catch(err => console.log('DB Error :( '));