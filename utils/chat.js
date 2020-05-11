let User = require('../models/userModel')
module.exports = async function(req, newMessage) {
    
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
           chatList: {
               recieverId: req.params.reciever_Id
           } 
        }
    })

    await User.findByIdAndUpdate(req.params.reciever_Id, {
        $pull: {
           chatList: {
               recieverId: req.user._id
           } 
        }
    })

    await User.findByIdAndUpdate(req.user._id, {
        $push: {
            chatList: {
                $each: [
                    {
                        recieverId: req.params.reciever_Id,
                        messageId: newMessage._id
                    }
                ],
                $position: 0
            }
        }
    })

    await User.findByIdAndUpdate(req.params.reciever_Id, {
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
}
