import utils from "../../common/utils";
import im from "../../common/im";
import messageUtils from "../../components/message-utils";
import { TRANSFER_TYPE } from "../../common/enum";
import common from "../../common/common";

let juggle = im.getCurrent();
let { MessageType, ConversationType, MentionType } = juggle;

function readMessage(messages){
  if(!utils.isEmpty(messages)){
    juggle.readMessage(messages).then(() => {
      console.log('read message successfully.')
    }, (error) => {
      console.log('read message error', error)
    });
  }
}

function getMessages(isFirst, callback, state, props) {
  if(!im.isConnected()){
    return;
  }
  callback = callback || utils.noop;
  let { conversationType, conversationId, latestMessage } = props.conversation;
  let params = { time: 0 };
  if (isFirst) {
    params.time = 0;
  }else{
    let message = state.messages[state.messages.length - 1];
    utils.extend(params, { time: message.sentTime });
  }
  utils.extend(params, { conversationType, conversationId });
  juggle.getMessages(params).then((result) => {
    let { messages, isFinished } = result;
    messages.reverse();
    console.log('getMessages', messages)
    let unReadMsgs = [];
    utils.forEach(messages, (message, index) => {
      if (index % 6 == 0 && index > 0) {
        let time = utils.formatTime(message.sentTime);
        let notifyMsg = { name: 'notify', sentTime: time };
        state.messages.push(notifyMsg);
      }
      if(isGroup(message)){
        utils.extend(message, {
          readPercent: messageUtils.getGroupReadPercent(message)
        })
      }
      let { sender } = message;
      if(!sender.portrait){
        let name = sender.name || '默认';
        sender.portrait = common.getTextAvatar(name, { height: 60, width: 60 });
      }

      utils.extend(message, { isSelected: false, sender })
      state.messages.push(message);
      
      if(isGroup(message)){
        if(!message.isSender){
          unReadMsgs.push(message);
        }
      }else{
        if(!message.isSender && !message.isRead){
          unReadMsgs.push(message);
        }
      }
    });
    state.isFinished = isFinished;
    callback(callback);

    readMessage(unReadMsgs);
  }, (error) => {
    console.log(error);
  })
}
function sendVideo(file, message, callback, state){
  let content = { 
    file: file
  };  
  utils.extend(message, { content, localUrl: URL.createObjectURL(file), name: MessageType.VIDEO });
  state.messages.unshift(message);

  let propMsg = state.messages.filter((msg) => {
    return utils.isEqual(msg.tid, message.tid);
  })[0];

  juggle.sendVideoMessage(message, {
    onprogress: ({ percent }) => {
      utils.extend(propMsg, { percent });
    }
  }).then((result) => {
    let { messageId, sentTime, content } = result;
    utils.extend(propMsg, { messageId, sentTime, content });
    callback();
  }, (error) => {
    console.log(error)
  })
}
function sendFile(file, message, callback, state){
  let content = { 
    file: file,
    name: file.name,
    type: file.type,
    size: file.size
  };  
  utils.extend(message, { content });

  juggle.sendFileMessage(message, {
    onbefore: (msg) => {
      console.log('file msg', msg)
      state.messages.unshift(msg);
    },
    onprogress: ({ percent, message }) => {
      let propMsg = state.messages.filter((msg) => {
        return utils.isEqual(msg.tid, message.tid);
      })[0];
      utils.extend(propMsg, { percent });
    }
  }).then(({ tid, messageId, sentTime, content }) => {
    let propMsg = state.messages.filter((msg) => {
      return utils.isEqual(msg.tid, tid);
    })[0];
    utils.extend(propMsg, { messageId, sentTime, content });
    callback();
  }, (error) => {
    console.log(error)
  })
}
function isGroup(currentConversation){
  return utils.isEqual(currentConversation.conversationType, ConversationType.GROUP);
}
function updateMentionMember(type, state){
  if(!isGroup(state.currentConversation)){
    return;
  }
  let { selectMentionIndex, mentionMembers } = state;
  if(utils.isEqual(type, 'up')){
    selectMentionIndex -= 1;
    if(selectMentionIndex < 0){
      selectMentionIndex = mentionMembers.length - 1;
    }
  }
  if(utils.isEqual(type, 'down')){
    selectMentionIndex += 1;
    if(selectMentionIndex >= mentionMembers.length){
      selectMentionIndex = 0;
    }
  }
  utils.extend(state, { selectMentionIndex });
}
function isSameConversation(message, state){
  let { currentConversation: item } = state;
  return utils.isEqual(item.conversationId, message.conversationId) && utils.isEqual(item.conversationType, message.conversationType); 
}
function transfer(type, conversations, msgs, state){
  if(utils.isEqual(TRANSFER_TYPE.ONE, type)){
    sendOne(conversations, msgs, state);
  }else{
    sendMerge(conversations, msgs, state);
  }
}
function sendOne(conversations, msgs, state){
  utils.iterate(conversations, (conversation, conversationNext) => {
    utils.iterate(msgs, (message, messageNext, isFinished) => {
      sendMsg(conversation, message, (_msg) => {
        if(isSameConversation(conversation, state) && _msg){
          state.messages.unshift(_msg);
        }
        if(isFinished){
          conversationNext();
        }else{
          messageNext();
        }
      });
    });
  });
}
function sendMerge(conversations, msgs, state){
  let labels = [];
  let title = '';
  utils.forEach(msgs, (msg) => {
    let content = im.msgShortFormat(msg);
    labels.push({ content, senderName: msg.sender.name  });
    if(isGroup(msg)){
      title = '群的聊天记录';
    }else{
      title = `${msg.conversationTitle} 和 ${msg.sender.name} 的聊天记录`
    }
  });
 
  utils.iterate(conversations, (conversation, next) => {
    let params = {
      conversationId: conversation.conversationId,
      conversationType: conversation.conversationType,
      messages: msgs,
      previewList: labels,
      title: title
    };
    juggle.sendMergeMessage(params).then((msg) => {
      if(isSameConversation(conversation, state)){
        state.messages.unshift(msg);
      }
      console.log(msg)
      next();
    }, (error) => {
      console.log(error);
      next();
    });
  });
}
function sendMsg(conversation, message, callback){
  let msg = {
    conversationId: conversation.conversationId,
    conversationType: conversation.conversationType,
    name: message.name,
    content: message.content
  };
  juggle.sendMessage(msg).then((_msg) => {
    callback(_msg);
  }, () => {
    callback();
  });
}
export default {
  readMessage,
  getMessages,
  sendFile,
  sendVideo,
  updateMentionMember,
  isGroup,
  isSameConversation,
  transfer,
}