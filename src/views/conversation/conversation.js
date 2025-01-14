import utils from "../../common/utils";
import im from "../../common/im";
import messageUtils from "../../components/message-utils";
import { TRANSFER_TYPE } from "../../common/enum";
import common from "../../common/common";
import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";

let juggle = im.getCurrent();
let { MessageType, ConversationType, MentionType, UndisturbType, UnreadTag } = juggle;

function readMessage(messages){
  if(!utils.isEmpty(messages)){
    juggle.readMessage(messages).then(() => {
      console.log('read message successfully.')
    }, (error) => {
      console.log('read message error', error)
    });
  }
}

function clearUnreadCount(conversation){
  juggle.clearUnreadcount(conversation).then(() => {
    console.log('clearnunread successfully.')
  }, (error) => {
    console.log('clearnunread error', error)
  });
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

    let tranMgs = [];
    utils.forEach(messages, (message, index) => {
      if(!message.isSender && utils.isEqual(message.name, MessageType.TEXT)){
        tranMgs.push(message);
      }
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

      utils.extend(message, { isSelected: false, sender, streamMsg: { isEnd: false, streams: []} })

      let numIndex = utils.find(state.messages, (msg) => {
        return utils.isEqual(msg.messageId, message.messageId);
      });
      if(numIndex == -1){
        state.messages.push(message);
      }
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

    translate(state, tranMgs);

    readMessage(unReadMsgs);
  }, (error) => {
    console.log(error);
  })
}

function translate(state, msgs){
  if(utils.isEmpty(msgs)){
    return;
  }
  let list = utils.clone(msgs);
  let next = () => {
    let msg = list.splice(0, 1)[0];
    if(!msg){
      return;
    }

    let { messageId, content: { content } , conversationType, conversationId } = msg;

    let tranConf = Storage.get(`${STORAGE.TRANSLATE_CONF}_${conversationType}_${conversationId}`)
    if(!tranConf.isOpen){
      return;
    }

    let data = {};
    data[messageId] = content;
    
    juggle.translate({ targetLang: tranConf.target, sourceLang: tranConf.source, content: data }).then((result) => {
      let { messages } = state;
      utils.forEach(result, (content, messageId) => {
        let index = utils.find(messages, (msg ) => { return utils.isEqual(msg.messageId, messageId) });
        if(index > -1){
          messages[index].translation = content;
        }
      });
      next();
    });
  };
  next()
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
  }).then(({ tid, messageId, sentTime, content, messageIndex }) => {
    let propMsg = state.messages.filter((msg) => {
      return utils.isEqual(msg.tid, tid);
    })[0];
    utils.extend(propMsg, { messageId, sentTime, content, messageIndex });
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
function isSame(target, source){
  return utils.isEqual(target.conversationId, source.conversationId) && utils.isEqual(target.conversationType, source.conversationType); 
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
function isScrollTop(index){
  var chatNode = document.querySelector('.tyn-aside-list');
  var node = document.querySelector(`.tyn-aside-item[index="${index}"]`);
  let num = chatNode.offsetTop-node.getBoundingClientRect().bottom;
  return Math.abs(num) > 300;
}
function conversationDisturb(item){
  let conversation = { conversationId: item.conversationId, conversationType: item.conversationType, undisturbType: UndisturbType.DISTURB };
  if(utils.isEqual(item.undisturbType, UndisturbType.DISTURB)){
    conversation.undisturbType = UndisturbType.UNDISTURB;
    return juggle.disturbConversation(conversation).then(() => {
      console.log('set conversation disturb successfully');
    });
  }
  juggle.disturbConversation(conversation).then(() => {
    console.log('set conversation disturb successfully');
  });
}
function setConversationTop({ item, isTop, tops, conversations }) {
  let topIndex = utils.find(tops, top => {
    return utils.isEqual(top.conversationId, item.conversationId);
  });
  if (topIndex > -1) {
    tops[topIndex].isShowTopDrop = false;
    tops.splice(topIndex, 1);
  } else {
    tops.push(item);
  }

  let conversationIndex = utils.find(conversations, conver => {
    return utils.isEqual(conver.conversationId, item.conversationId);
  });

  if (conversationIndex > -1) {
    conversations[conversationIndex].isShowDrop = false;
    conversations[conversationIndex].isTop = isTop;
  }

  let _item = {
    conversationType: item.conversationType,
    conversationId: item.conversationId,
    isTop
  };
  juggle.setTopConversation(_item).then(() => {
    console.log("set conversation top successfully", _item);
  });
}
function updateDraft({ conversation, conversations }) {
  let { draft } = conversation;

  let index = utils.find(conversations, item => {
    return isSame(item, conversation);
  });
  if (utils.isEqual(index, -1)) {
    return;
  }
  utils.extend(conversations[index], { draft });
  if (utils.isEmpty(draft)) {
    juggle.removeDraft(conversation);
  } else {
    juggle.setDraft(conversation);
  }
}
function clearMessages(conversation) {
  utils.extend(conversation, {
    isShowDrop: false,
    unreadCount: 0
  });

  let params = {
    conversationType: conversation.conversationType,
    conversationId: conversation.conversationId,
    time: conversation.latestMessage.sentTime
  };
  juggle.clearMessage(params).then(
    () => {
      console.log("clear messages successfully");
    },
    error => {
      console.log(error);
    }
  );
}
function removeConversation(index, state) {
  let conversation = state.conversationMap[state.currentTag.id].splice(index, 1)[0];
  conversation.isShowDrop = false;
  let { conversationType, conversationId } = conversation;
  juggle.removeConversation({ conversationType, conversationId }).then(() => {
    console.log("remove conversation successfully");
  });
  let { currentConversation } = state;
  if (isSame(currentConversation, conversation)) {
    utils.extend(state, { currentConversation: {} });
  }
}
function markUnread(index, state) {
  let conversation = state.conversationMap[state.currentTag.id][index];
  let { unreadTag } = conversation;
  utils.extend(conversation, {
    isShowDrop: false,
    unreadTag: UnreadTag.UNREAD
  });

  if (utils.isEqual(unreadTag, UnreadTag.UNREAD)) {
    return clearUnreadCount(conversation, index);
  }
  let { conversationId, conversationType } = conversation;
  juggle.markUnread({
      conversationId: conversationId,
      conversationType: conversationType,
      unreadTag: UnreadTag.UNREAD
    }).then(
      () => {
        console.log("markunread successfully");
      },
      error => {
        console.log(error);
      }
    );
}
function insertTempConversation(query, state) {
  if (query.id) {
    common.getConversationInfo(query, info => {
      let { id: conversationId, type: conversationType } = query;
      conversationType = Number(conversationType);

      let conversations = state.conversationMap[state.currentTag.id] || [];

      let index = utils.find(conversations, item => {
        return (
          utils.isEqual(item.conversationType, conversationType) &&
          utils.isEqual(item.conversationId, conversationId)
        );
      });

      let message = {
        name: MessageType.TEXT,
        content: { content: "[新会话]" },
        sentTime: Date.now(),
        messageIndex: -1
      };
      if (!utils.isEqual(index, -1)) {
        var item = conversations.splice(index, 1)[0] || {};
        utils.extend(message, item);
      }
      let { nickname, avatar } = info;
      let conversation = {
        conversationId,
        conversationType,
        conversationTitle: nickname,
        conversationPortrait: avatar || common.getTextAvatar(nickname),
        shortName: im.msgShortFormat(message),
        latestMessage: message,
        isActive: true
      };
      conversations.map(item => {
        item.isActive = false;
        return item;
      });
      console.log("insert new converation", conversation);
      conversations.unshift(conversation);
      utils.extend(state, { currentConversation: conversation });
    });
  }
}
function getTops(state) {
  juggle.getTopConversations().then(result => {
    let { conversations, isFinished } = result;
    conversations = utils.map(conversations, item => {
      let { conversationPortrait, conversationTitle } = item;
      item.conversationPortrait =
        conversationPortrait || common.getTextAvatar(conversationTitle);
      return item;
    });
    state.tops = conversations;
  });
}
function updateLocalTopMsg(isTop, message, operator){
  let shortName = im.msgShortFormat(message);
  if(!isTop){
    return {};  
  }
  return { 
    createdTime: Date.now(), 
    message: message, 
    shortName: shortName,
    operator: operator,
  }
}
function setTopMessage(state, isTop, message){
  juggle.setTopMessage({
    conversationType: message.conversationType,
    conversationId: message.conversationId,
    messageId: message.messageId,
    isTop: isTop,
  }).then(() =>{
    let user = Storage.get(STORAGE.USER_TOKEN);
    let result = updateLocalTopMsg(isTop, message, user);
    state.pinnedMessage = result;
  });
}
function getTopMessage(state, message){
  let { conversationType, conversationId } = message;
  if(!conversationId){
    return;
  }
  juggle.getTopMessage({ conversationType, conversationId }).then((result) =>{
    if(utils.isEmpty(result.message)){
      return state.pinnedMessage = {};
    }
    let shortName = im.msgShortFormat(result.message);
    state.pinnedMessage = { 
      ...result,
      shortName: shortName
    }
  });
}
function addFavoriteMsg(message, callback){
  let { conversationType, conversationId, messageId, sender } = message;
  let messages = [{ 
    conversationType,
    conversationId,
    messageId,
    senderId: sender.id,
  }];
  return juggle.addFavoriteMessages({ messages }).then((result) =>{
    callback(null);
  }, (error) => {
    callback(error);
  });
}
export default {
  isScrollTop,
  readMessage,
  getMessages,
  sendFile,
  sendVideo,
  updateMentionMember,
  isGroup,
  isSameConversation,
  transfer,
  clearUnreadCount,
  conversationDisturb,
  setConversationTop,
  updateDraft,
  clearMessages,
  removeConversation,
  markUnread,
  insertTempConversation,
  isSame,
  getTops,
  translate,
  setTopMessage,
  updateLocalTopMsg,
  getTopMessage,
  addFavoriteMsg,
}