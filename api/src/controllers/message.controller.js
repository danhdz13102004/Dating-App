
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

class MessageController {
  add = async (req, res, next) => {
    console.log(`[P]::Message_add::`, req.body);
    const { conversation, sender, content, createdAt, updatedAt } = req.body;
    const result = await Message.insertOne({
      conversation: conversation,
      sender: sender,
      content: content,
      status: "sent",
      createdAt: createdAt?createdAt: new Date().toISOString(),
      updatedAt: updatedAt?updatedAt: new Date().toISOString(),
    });

    const result_con = await Conversation.updateOne(
      {_id: conversation},
      {
        $set:{
          last_message:content
        }
      },
      {upsert: true}
    )

    console.log(`[P]::Message_add::Result::`, result);
    console.log(`[P]::Conversation_uppdate::Result::`, result_con);

    return res.status(201).json(result);
  };

  
}

module.exports = new MessageController();
