import utils from "../../common/utils";
import im from "../../common/im";
import messageUtils from "../../components/message-utils";
import { TRANSFER_TYPE, CONVERATION_TAG_ID, IGNORE_CONVERSATIONS } from "../../common/enum";
import common from "../../common/common";
import conversationTools from "./conversation";

let juggle = im.getCurrent();
let { MessageType, ConversationType, MentionType, UndisturbType } = juggle;

export default function(conversations, state){
  utils.forEach(conversations, conversation => {
    console.log("conversation", conversation);

    if(utils.isInclude(IGNORE_CONVERSATIONS, conversation.conversationId)){
      return;
    }
    
    if (!conversation.latestMessage) {
      return;
    }
    let { tags = [] } = conversation;
    let allIndex = utils.find(tags, (tag) => {
      return utils.isEqual(tag.id, CONVERATION_TAG_ID.ALL)
    })
    if(utils.isEqual(allIndex, -1)){
      tags.push({ id: CONVERATION_TAG_ID.ALL });
    }
    
    utils.forEach(tags, (currentTag) => {
      conversation.f_mentionContent = common.formatMention(conversation);
      let conversations = state.conversationMap[currentTag.id];
      if(!conversations){
        conversations = [];
        state.conversationMap[currentTag.id] = conversations;
      }
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
        let oldConversation = state.conversationMap[currentTag.id][index];
        let { isActive, draft } = oldConversation;

        utils.extend(conversation, { draft });
        
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
          state.conversationMap[currentTag.id].splice(index, 1)[0];
          state.conversationMap[currentTag.id].unshift(conversation);
        } else {
          state.conversationMap[currentTag.id].splice(index, 1, utils.clone(conversation));
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
        state.conversationMap[currentTag.id].unshift(conversation);
      }
      if (conversationTools.isSame(conversation, state.currentConversation)) {
        utils.extend(state.currentConversation, conversation);
      }
    });
  });
}