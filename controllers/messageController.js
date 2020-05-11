let catchAsync = require('../utils/catchAsync')
let Message = require('../models/messageModel')
let Conversation = require('../models/conversationModel')
let User = require('../models/userModel')
let updateChatList = require('../utils/chat')

exports.sendMessage = catchAsync(async (req, res, next) => {
    let { reciever_Id } = req.params
    Conversation.find({
        $or: [
            { participants: { $elemMatch: { senderId: req.user._id, recieverId: reciever_Id } } },
            
            { participants: { $elemMatch: { senderId: reciever_Id, recieverId: req.user._id } } }
        ]
    })
    .then(async result => {
        if(result.length) {
            let message = await Message.findOne({ conversationId: result[0]._id })
           await updateChatList(req, message)
            await Message.updateOne({ conversationId: result[0]._id }, {
                $push: {
                    message: {
                            senderId: req.user._id,
                            recieverId: reciever_Id,
                            senderName: req.user.username,
                            recieverName: req.body.recieverName,
                            body: req.body.message
                        }
                }
            })
            res.status(200).json({ msg: 'message sent and added.' })
        } else {
            let newConversation = new Conversation()
            newConversation.participants.push({
                senderId: req.user._id, 
                recieverId: reciever_Id
            })
            let saveConversation = await newConversation.save()
            let newMessage = new Message()
            newMessage.conversationId = saveConversation._id
            newMessage.sender = req.user.username
            newMessage.reciever = req.body.recieverName
            newMessage.message.push({
                senderId: req.user._id,
                recieverId: reciever_Id,
                senderName: req.user.username,
                recieverName: req.body.recieverName,
                body: req.body.message
            })
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    chatList: {
                        $each: [
                            {
                                recieverId: reciever_Id,
                                messageId: newMessage._id
                            }
                        ],
                        $position: 0
                    }
                }
            })
        
            await User.findByIdAndUpdate(reciever_Id, {
                $push: {
                    chatList: {
                        $each: [
                            {
                                recieverId: req.user._id,
                                messageId: newMessage._id
                            }
                        ],
                        $position: 0
                    }
                }
            })
        
            await newMessage.save()
            res.status(200).json({ msg: 'message sent and saved.' })
        }
    })
}) 

exports.getMessages = catchAsync(async(req, res, next) => {
    let recieverId = req.params.reciever_Id
    let conversation = await Conversation.findOne({
        $or: [
            {
                $and: [
                    {'participants.senderId': req.user._id },
                    { 'participants.recieverId': recieverId }
                ]
            },
            {
                $and: [
                    {'participants.senderId': recieverId },
                    { 'participants.recieverId': req.user._id }
                ]
            }
        ]
    }).select('_id')
    if(conversation) {
        let message = await Message.findOne({ conversationId: conversation._id })
        res.status(200).json(message)
    }
})

exports.markRecieverMsg = catchAsync(async(req, res, next) => {
    let { reciever } = req.params
    let msg = await Message.aggregate([
        {
            $unwind: '$message'
        },
        {
            $match: {
                $and: [
                    {
                        'message.senderName': reciever,
                        'message.recieverName': req.user.username
                    }
                ]
            }
        }
    ])
    if(msg.length) {
            msg.forEach(async m => {
                await Message.updateOne({
                    'message._id': m.message._id
                },
                {
                $set: {
                    'message.$.isRead': true
                }
            })
            })
            res.status(200).json({ msg: 'marked true.' })
    }
})


exports.markAllMsgs = catchAsync(async(req, res, next) => {
    let msg = await Message.aggregate([
      {
          $match: {
              'message.recieverName': req.user.username
          }
      },
      {
          $unwind: '$message' 
      },
      {
        $match: {
            'message.recieverName': req.user.username
        }
      }
    ])
    if(msg.length) {
            msg.forEach(async m => {
                await Message.updateOne({
                    'message._id': m.message._id
                },
                {
                $set: {
                    'message.$.isRead': true
                }
            })
            })
            res.status(200).json({ msg: 'all marked true.' })
    }
})