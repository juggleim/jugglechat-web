import utils from "../../common/utils";
import im from "../../common/im";
import messageUtils from "../../components/message-utils";
import { TRANSFER_TYPE } from "../../common/enum";
import common from "../../common/common";
import conversationTools from "./conversation";

let juggle = im.getCurrent();
let { MessageType, ConversationType, MentionType, UndisturbType } = juggle;

export default function(conversations, state){
  utils.forEach(conversations, conversation => {
    let { conversations } = state;
    let {
      conversationId,
      conversationType,
      latestMessage,
      unreadCount
    } = conversation;
    let index = utils.find(conversations, item => {
      return (
        utils.isEqual(item.conversationType, conversationType) &&
        utils.isEqual(item.conversationId, conversationId)
      );
    });
    state.conversations.splice(index, 1)[0];
  });
}