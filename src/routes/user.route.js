'use strict';

const express = require('express');
const router = express.Router();
const { users, usersModel, db } = require('../models');
const basicAuth = require('../middleware/basic.js')
// const bearerAuth = require('../middleware/bearer.js');

router.post('/signup', signUp);
router.post('/signin', basicAuth, signIn);
router.get('/fetchUserData', fetchUserData);
router.get('/searchUser', fetchUserData);
router.get('/getRandomUsers', getRandomUsers);
// router.get('/secret', bearerAuth, async (req, res, next) => {
//   res.status(200).send('Welcome to the secret area, ' + req.user.username)
// });


async function signUp(req, res, next){
  try {
    let userRecord = await users.create(req.body);
    res.status(201).json(userRecord);
  } catch (e) {
    next('sign up err: ' + e.message)
  }
}

async function signIn(req, res, next){
  res.status(200).json(req.user);
}


async function fetchUserData(req, res, next){
  try{
    const username = req.query.username;
    const finduser = await usersModel.findOne({ where: { username: username } });
    res.status(200).json(finduser);
  }catch(err){
    console.error('something went wrong when trying to fetch the users data, the username provided is not valid. err: ', err);
  }
}

async function getRandomUsers(req, res, next) {
  try {
    const randomUsers = await usersModel.findAll({
      order: db.literal('RANDOM()'),
      limit: 5,
    });

    res.status(200).json(randomUsers);
  } catch (error) {
    console.error(error);
    next('error when getting random users');
  }
}

module.exports = router;
