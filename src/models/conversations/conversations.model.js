'use strict';

const conversationModel = (sequelize, DataTypes) => {
  const model = sequelize.define('conversations', {
    members: {
      type: DataTypes.STRING,
      unique: true,
    }
  });
  
  return model;
}

module.exports = conversationModel;