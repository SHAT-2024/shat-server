'use strict';

const usersToConversationModel = (sequelize, DataTypes) => {
  const model = sequelize.define('usersToConversations', {
    conversationType: {
      type: DataTypes.STRING
    }
  });

  return model;
}

module.exports = usersToConversationModel;
