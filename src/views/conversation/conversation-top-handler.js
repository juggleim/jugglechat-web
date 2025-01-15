import utils from "../../common/utils";
import im from "../../common/im";
import messageUtils from "../../components/message-utils";
import { TRANSFER_TYPE } from "../../common/enum";
import common from "../../common/common";
import conversationTools from "./conversation";

let juggle = im.getCurrent();
let { MessageType, ConversationType, MentionType, UndisturbType } = juggle;

export default function(conversations, state){
  let { tops } = state;
  utils.forEach(conversations, async (conversation) => {
    let { isTop } = conversation;
    let index = utils.find(tops, (top) => { return utils.isEqual(top.conversationId, conversation.conversationId); })
    if(index > -1 && !isTop){
      tops.splice(index, 1)
    }
    if(index == -1 && isTop){
      tops.push(conversation);
      juggle.getConversation(conversation).then((item) =>{
        let i = utils.find(tops, (top) => { return utils.isEqual(top.conversationId, conversation.conversationId); });
        if(i > -1){
          utils.extend(tops[i], item.conversation);
        }
      });
    }
  });
}