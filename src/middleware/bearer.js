'use strict';

const { users } = require('../models')

module.exports = async (req, res, next) => {

  try {

    if (!req.headers.authorization) next('no headers authorization found: ' + e);

    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.model.authenticateToken(token);
    req.user = validUser;
    next();

  } catch (e) {
    next('error during bearer auth process: ' + e);
  }

}
