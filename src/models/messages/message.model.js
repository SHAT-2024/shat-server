'use strict';

const messageModel = (sequelize, DataTypes) => {
  const model = sequelize.define('messages', {
    senderID:{
      type: DataTypes.INTEGER, 
    },
    conversationID:{
      type: DataTypes.INTEGER, 
    },
    content:{
      type: DataTypes.STRING, 
    }
  });

  return model;
}

module.exports = messageModel;