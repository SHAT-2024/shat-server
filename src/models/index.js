'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const Collection = require('./LIB/collection');
const user = require('./users/user.model');
const conversation = require('./conversations/conversations.model');
const message = require('./messages/message.model');
const usersToConversation = require('./usersToConversations/usersToConversations');


const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite:memory' : process.env.DATABASEURI;

let sequelizeOption = process.env.NODE_ENV === 'production' ? {
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        }
      }
} : {};

let sequelize = new Sequelize(DATABASE_URL, sequelizeOption);

const usersModel = user(sequelize, DataTypes);
const usersCollection = new Collection(usersModel);

const conversationsModel = conversation(sequelize, DataTypes);
const conversationsCollection = new Collection(conversationsModel);

const usersToConversationsModel = usersToConversation(sequelize, DataTypes);
const usersToConversationsCollection = new Collection(usersToConversationsModel);

const messagesModel = message(sequelize, DataTypes);
const messagesCollection = new Collection(messagesModel);

usersModel.belongsToMany(conversationsModel, { 
  through: usersToConversationsModel
});
conversationsModel.belongsToMany(usersModel, {  
  through: usersToConversationsModel
});

conversationsModel.hasMany(messagesModel, { foreignKey: 'conversationID', sourceKey: 'id' });
messagesModel.belongsTo(conversationsModel, { foreignKey: 'conversationID', targetKey: 'id' });

// add an association between conversations||users and the messages so the users have the option to delete the messages only for them or all in the conversation

module.exports = {
  sequelizeee : Sequelize,
  db: sequelize,
  users: usersCollection,
  usersModel: usersModel,
  conversations: conversationsCollection,
  conversationsModel: conversationsModel,
  usersToConversations: usersToConversationsCollection,
  usersToConversationsModel: usersToConversationsModel,
  messages: messagesCollection,
  messagesModel: messagesModel
}