'use strict';

const dataModules = require('../models');

function modelsMiddleware(req, res, next){
  const modelName = req.params.model;
  req.model = dataModules[modelName];
  if (dataModules[modelName]) {
    next();
  } else {
    next('Invalid Model');
  }
}


module.exports = modelsMiddleware;