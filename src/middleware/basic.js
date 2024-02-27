'use strict';

const base64 = require('base-64');
const { users } = require('../models');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) next('no headers authorization found: ' + e);

  let basic = req.headers.authorization.split(' ').pop();
  let [user, pass] = base64.decode(basic).split(':');
  
  try {
    req.user = await users.model.authenticateBasic(user, pass);
    next();
  } catch (e) {
    next('error with sing-in process: ' + e);
  }

}
