"use strict";

const express = require("express");
const router = express.Router();
const {
  usersModel,
  conversationsModel,
  usersToConversationsModel,
  messagesModel
} = require("../models");
const { Op } = require("sequelize");

router.get(
  "/IsCurrentUserHasAnyConversations/:currentUserId",
  checkIfThisCeratinUserHasAnyConversations
);//
// router.get(
//   "/getCurrentUserConversations2/:currentUserId",
//   getCurrentUserConversations2
// );// get the users alongside their conversations (not used)
router.post(
  "/createConversation/:currentUsernameId/:receiverId",
  createConveration
); // create a conversation if not exists
router.get(
  "/getCurrentUserConversations/:usernameId",
  getCurrentUserConversation
); //the current user conversation details
router.get(
  "/getAllMessagesInConversation/:conversationId",
  getMessages
); //get all message for a certain conversation
router.get(
  "/getCoversationId/:currentUsernameId/:receiverId",
  getCoversationId
);
router.delete(
  "/DeleteConversationForACeratinUser/:currentUsernameId/:conversationId",
  DeleteConversationForACeratinUser
);

const formatDateFun = (date) =>{
  const dateTS = new Date(date);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = dateTS.getDate();
  const month = months[dateTS.getMonth()];
  const hours = dateTS.getHours() % 12 || 12;
  const minutes = dateTS.getMinutes();
  const period = dateTS.getHours() >= 12 ? 'PM' : 'AM';
  
  const formattedDate = `${day} ${month} ${hours}:${minutes}${period}`;
  return formattedDate;
}

async function checkIfThisCeratinUserHasAnyConversations(req, res, next) {
  try{
    let currentUserId = parseInt(req.params.currentUserId);
    const allusers = await usersModel.findAll({ include: [conversationsModel] });
    const array = allusers.filter((user) => user.conversations.length !== 0);
    const array2 = array.map((user) => user.id);
    res.status(200).send(array2.includes(currentUserId));
  }catch (err) {
    console.log("Error while checking if the user has any conversations, err: ", err);
  }
}

// async function getCurrentUserConversations2(req, res, next) {
//   let currentUserId = parseInt(req.params.currentUserId);
//   const allusers = await usersModel.findAll({ include: [conversationsModel] });
//   const array = allusers.filter((user) => user.conversations.length !== 0);
//   // const array2 = array.map(user => user.id);
//   res.status(200).send(array);
// }

async function createConveration(req, res, next) {
  try {
    const currentUsernameId = req.params.currentUsernameId;
    const receiverId = req.params.receiverId;

    const memberIds = [currentUsernameId, receiverId].sort(); // Sort the IDs in ascending order, so i don't have to check the members twice or more
    const membersString = memberIds.join(",");

    const checkConIfAlreadyExists = await conversationsModel.findOne({
      where: { members: membersString },
    });

    if (!checkConIfAlreadyExists) {//there is no conversation at all
      const obj = {
        members: membersString,
      };

      let record = await conversationsModel.create(obj);

      if (record) {
        const sender = await usersModel.findOne({
          where: { id: currentUsernameId },
        });
        sender.addConversations(record);
        const receiver = await usersModel.findOne({
          where: { id: receiverId },
        });
        receiver.addConversations(record);

        res.status(200).send(record);
      }else{
        console.error('error while creating a new conversation');
      }
    
  }else{ //the conversation already exists or one of the users deleted it
      
    const convId = checkConIfAlreadyExists.id;

    const doesCurrentUserStillHasTheConversation = await usersToConversationsModel.findAll({
      where: {
          conversationId: convId,
          userId: currentUsernameId
        }
    })
    
    const doesReceiverUserstillHaveTheConversation = await usersToConversationsModel.findAll({
      where: {
          conversationId: convId,
          userId: receiverId
        }
    })

    if (doesCurrentUserStillHasTheConversation.length !== 0 && doesReceiverUserstillHaveTheConversation.length !== 0) {//conversation already exists
      res.status(200).send('conversation already exists');
    }else {//one of the users deleted the conversation
      if(doesCurrentUserStillHasTheConversation.length === 0){
        const sender = await usersModel.findOne({
          where: { id: currentUsernameId },
        });
        sender.addConversations(checkConIfAlreadyExists);
        res.status(200).send(checkConIfAlreadyExists);
      }else if(doesReceiverUserstillHaveTheConversation.length === 0){
        const receiver = await usersModel.findOne({
          where: { id: receiverId },
        });
        receiver.addConversations(checkConIfAlreadyExists);
        res.status(200).send(checkConIfAlreadyExists);
      }
    }

    }
  } catch (err) {
    console.log("Error creating a new conversation", err);
  }
}

async function getCurrentUserConversation(req, res, next) {
  try{
    const currentUserId = req.params.usernameId;

    let result = [];
    
    const currentUserConversations = await usersToConversationsModel.findAll({
      where: { userId: currentUserId },
    });

    const conversationIDs = currentUserConversations.map(
      (UTC) => UTC.conversationId
    );

    conversationIDs.map((convId) => result.push({ conversationId: convId }));

    const receiversIDsWithConversationIDs = [];

    for (let i = 0; i < conversationIDs.length; i++) {
      receiversIDsWithConversationIDs.push(
        await usersToConversationsModel.findAll({
          where: {
              conversationId: conversationIDs[i],
              userId: {
                [Op.not]: currentUserId,
              },
            },
        })
      );
    }

    // array of arrays(because receivers may be more than one person in case of a group), and that result has the same length of receiversIDsWithConversationIDs
    for (let i = 0; i < receiversIDsWithConversationIDs.length; i++) {
      for(let j=0; j<receiversIDsWithConversationIDs[i].length; j++){
          // result[i].userId = receiversIDsWithConversationIDs[i][j].userId;
          const receiver = await usersModel.findOne({where: { id: receiversIDsWithConversationIDs[i][j].userId }});
          result[i].receiverName = receiver.username;
          result[i].receiverAvatar = receiver.photoURL;
      }
    }

    const conversationsMessages = [];

    for(let i = 0; i < result.length; i++){
      const records = await conversationsModel.findOne({
          where: { id: result[i].conversationId },
          include: messagesModel
      });
      conversationsMessages.push(records.messages[records.messages.length-1]);
    }

    for(let i = 0; i < conversationsMessages.length; i++){
      result[i].lastMessage = conversationsMessages[i].content;
      result[i].timestamp = conversationsMessages[i].createdAt;
      result[i].lastSender = conversationsMessages[i].senderID;
    }  

    const sortedresults = result.sort((a, b) => {
      return String(b.timestamp).localeCompare(String(a.timestamp));
    });

    const resultsWithBetterate = sortedresults.map((conv) => {
      return {
        ...conv,
        timestamp: formatDateFun(conv.timestamp),
      };
    });

    res.status(200).send(resultsWithBetterate);
  }catch(err){
    res.status(200).send(['error while gettin a conversation']);
  }
}

async function getMessages(req, res, next) {
    try{
        let conversationId = req.params.conversationId;
        const records = await conversationsModel.findOne({
            where: { id: conversationId },
            include: messagesModel
        });
        console.log(conversationId);

        // records.messages.sort((a, b) => {
        //   return String(a.createdAt).localeCompare(String(b.createdAt));
        // });

        res.status(200).send(records);
    }catch(err){
        console.error(err);
    }
}

async function getCoversationId(req, res, next) {
  try{
    const currentUsernameId = req.params.currentUsernameId;
    const receiverId = req.params.receiverId;
  
    const memberIds = [currentUsernameId, receiverId].sort();
    const membersString = memberIds.join(",");
  
    const checkConIfAlreadyExists = await conversationsModel.findOne({
      where: { members: membersString },
    });
  
    if(checkConIfAlreadyExists){
      const convId = checkConIfAlreadyExists.id;

      const doesCurrentUserStillHasTheConversation = await usersToConversationsModel.findAll({
        where: {
            conversationId: convId,
            userId: currentUsernameId
          }
      })
      
      const doesReceiverUserstillHaveTheConversation = await usersToConversationsModel.findAll({
        where: {
            conversationId: convId,
            userId: receiverId
          }
      })
      
      if (doesCurrentUserStillHasTheConversation.length !== 0 && doesReceiverUserstillHaveTheConversation.length !== 0) {
        res.status(200).send(checkConIfAlreadyExists);
      }else res.status(200).send('one of the users deleted the conversation');

    }else{
      res.status(200).send('no conversation');
    }
    
  }catch(err){
    console.error('something went wrong while trying to get the conversation ID : ', err);
  }
}
  
async function DeleteConversationForACeratinUser(req, res, next) {
  try{
    const currentUsernameId = req.params.currentUsernameId;
    const conversationId = req.params.conversationId;
  
    const findTheConv =  await usersToConversationsModel.destroy({
      where: {
          conversationId: conversationId,
          userId: currentUsernameId
        }
    })

    res.status(200).json(findTheConv);

  }catch(err){
    console.log('error while deleting a conversation: ', err);
  }

}
  

module.exports = router;
