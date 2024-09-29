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
    console.log("conversation", conversation);

    if (!conversation.latestMessage) {
      return;
    }
    common.formatMention(conversation);
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
    if (!utils.isEqual(index, -1)) {
      let oldConversation = state.conversations[index];
      let { isActive } = oldConversation;

      if (!conversation.conversationTitle) {
        let { conversationTitle } = oldConversation;
        utils.extend(conversation, { conversationTitle });
      }

      if (!conversation.conversationPortrait) {
        let { conversationPortrait } = oldConversation;
        utils.extend(conversation, { conversationPortrait });
      }

      if (latestMessage.sentTime >= oldConversation.latestMessage.sentTime) {
        let shortName = im.msgShortFormat(latestMessage);
        let { sentTime } = latestMessage;
        let f_time = common.getConversationTime(sentTime);
        if (!sentTime) {
          f_time = "";
        }
        utils.extend(conversation, {
          f_time,
          isShowDrop: false,
          shortName,
          latestMessage: latestMessage,
          unreadCount
        });
      } else {
        utils.extend(oldConversation, { unreadCount });
      }

      utils.extend(conversation, { isActive });
      if (conversation.sortTime > oldConversation.sortTime) {
        state.conversations.splice(index, 1)[0];
        state.conversations.unshift(conversation);
      } else {
        state.conversations.splice(index, 1, utils.clone(conversation));
      }
    } else {
      let { latestMessage } = conversation;
      let shortName = im.msgShortFormat(latestMessage);
      let { sentTime } = latestMessage;
      let f_time = common.getConversationTime(sentTime);
      if (!sentTime) {
        f_time = "";
      }
      utils.extend(conversation, { f_time, isShowDrop: false, shortName });
      state.conversations.unshift(conversation);
    }
    if (conversationTools.isSame(conversation, state.currentConversation)) {
      utils.extend(state.currentConversation, conversation);
    }
  });
}