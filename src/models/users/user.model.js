'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 's2000';

const userModel = (sequelize, DataTypes) => {
  const model = sequelize.define('users', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true
    },
    username: { 
      type: DataTypes.STRING, 
      allowNull: false,
      required: true, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      required: true
    },
    photoURL: { 
      type: DataTypes.TEXT, 
      required: false 
    },
    bio: {
      type: DataTypes.STRING,
      required: false 
    },
    favColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#af8cfb'
    },
    token: {
      type: DataTypes.VIRTUAL,
    }
  });

  
  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { 
      user.token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET);
      return user; 
    }
    throw new Error('password is wrong');
  };

  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({ where: { username: parsedToken.username } });
      if (user) return user;
      else throw new Error("invalid token");
    } catch (e) {
      throw new Error("invalid token" + e.message)
    }
  };

  return model;
}

module.exports = userModel;