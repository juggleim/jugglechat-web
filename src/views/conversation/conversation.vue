<script setup>
import Emoji from "../../components/emoji.vue"
import ModalTransfer from "../../components/modal-transfer.vue";
import ModalImgSender from "../../components/modal-img-sender.vue";
import ModalMergeMsgs from "../../components/modal-merge-msgs.vue";
import Mention from "../../components/mention.vue";
import Transfer from "../../components/transfer-panel.vue";
import Reply from "../../components/reply.vue";
import ConversationAsider from "./conversation-aside.vue";
import { reactive, shallowRef, watch, nextTick, getCurrentInstance } from "vue";
import { preview } from 'vue3-image-preview';
import im from "../../common/im";

import Text from '../../components/message-text.vue';
import StreamText from '../../components/message-stream-text.vue';
import File from '../../components/message-file.vue';
import ImageMessage from '../../components/message-image.vue';
import Video from '../../components/message-video.vue';
import Merge from '../../components/message-merge.vue';
import Known from '../../components/message-unknown.vue';
import Timeline from '../../components/message-timeline.vue';
import Without from '../../components/message-without.vue';
import RecallMessage from '../../components/message-recall.vue';
import GroupNtfMessage from '../../components/message-group-notify.vue';
import FriendNtfMessage from '../../components/message-friend-notify.vue';
import Call1v1FinishedMessage from '../../components/message-1v1-finished.vue';

import utils from "../../common/utils";
import conversationTools from "./conversation";
import messageUtils from "../../components/message-utils";
import Storage from "../../common/storage";

import { TRANSFER_TYPE, MSG_NAME, EVENT_NAME, MESSAGE_OP_TYPE, STORAGE } from "../../common/enum";
import common from "../../common/common";
import emitter from "../../common/emmit";
import { Group } from "../../services/index";

const props = defineProps(['conversation']);
const emit = defineEmits(["ondraft", "onclearmsg", "onquitgroup", "ontop", "ondisturb", "onback"]);

let TimelineMessage = shallowRef(Timeline);
let WithoutMessage = shallowRef(Without);


let juggle = im.getCurrent();
let { MessageType, Event, ConversationType, MentionType, SentState, MediaType } = juggle;

let context = getCurrentInstance();

let state = reactive({
  isShowAside: false,
  isShowEmoji: false,
  isShowTransfer: false,
  isShowTransferMember: false,
  isShowGroupMute: false,
  transferType: TRANSFER_TYPE.NONE,
  currentConversation: props.conversation,
  messages: [],
  isFinished: false,
  content: props.conversation.draft || '',
  modifyMessage: {},
  isShowMention: false,
  isShowMobileBack: true,
  isShowReply: false,
  currentReplyMessage: {},
  members: [],
  msgOpType: MESSAGE_OP_TYPE.TRANSLATE,
  mentionMembers: [
    // { id: 'all', val: '@', isActive: true, name: '所有人', portrait: '', isAll: true },
    // { id: 'userid1', val: '', isActive: false, name: 'Doraemon', portrait: '' },
  ],
  selectMentionIndex: 0,
  mentions: [],
  transferMsgs: [],
  currentMergeMessage: {},
  imgSender: {},

  group: {},
});

juggle.once(Event.MESSAGE_RECEIVED, (message) => {
  console.log('---------', message)
  if (conversationTools.isSameConversation(message, state)) {
    let index = utils.find(state.messages, (msg) => {
      return utils.isEqual(msg.messageId, message.messageId)
    });
    message.streamMsg = { isEnd: false, streams: [] };
    if(index == -1){
      state.messages.unshift(message);
    }else{
      state.messages.splice(index, 1, message);
    }
    scrollBottom();
    conversationTools.readMessage([message]);
    conversationTools.clearUnreadCount(message)
    let isText = utils.isEqual(message.name, MessageType.TEXT);
    if(isText && !message.isSender){
      conversationTools.translate(state, [message]);
    }
  }
});

juggle.once(Event.STREAM_APPENDED, ({ message }) => {
  if (conversationTools.isSameConversation(message, state)) {
    let msg = findMsgById(message) || {};
    if(utils.isEmpty(msg)){
      return;
    }
    let { streams } = message;
    utils.extend(msg.streamMsg, { isEnd: false, streams })
  }
});
juggle.once(Event.STREAM_COMPLETED, ({ message }) => {
  if (conversationTools.isSameConversation(message, state)) {
    let msg = findMsgById(message) || {};
    if(utils.isEmpty(msg)){
      return;
    }
    utils.extend(msg.streamMsg, { isEnd: true, streams: [] })
  }
});
function findMsgById(msg){
  let { messageId } = msg;
  let index = utils.find(state.messages, (_msg) => {
    return utils.isEqual(_msg.messageId, messageId);
  });
  return state.messages[index];
}

juggle.once(Event.MESSAGE_UPDATED, (notify) => {
  console.log(notify);
  if (conversationTools.isSameConversation(notify, state)) {
    let index = utils.find(state.messages, (msg) => {
      return utils.isEqual(msg.messageId, notify.messageId)
    });
    utils.extend(state.messages[index], {
      isUpdated: true,
      content: notify.content
    });
  }
});

juggle.once(Event.MESSAGE_REACTION_CHANGED, (notify) => {
  console.log(notify);
  if (conversationTools.isSameConversation(notify, state)) {
    let index = utils.find(state.messages, (msg) => {
      return utils.isEqual(msg.messageId, notify.messageId)
    });
    let message = state.messages[index];
    let list = notify.reactions;
    
    utils.forEach(list, (item) => {
      let { isRemove, key, value } = item;
      let _list = message.reactions[key] || [];
      if(isRemove){
        let _index = utils.find(_list, (_item) => { return _item.key == key});
        _list.splice(_index, 1);
      }else{
        _list.push({ key, value });
      }
      if(utils.isEqual(_list.length, 0)){
        delete message.reactions[key];
      }else{
        message.reactions[key] = _list;
      }
      
    });
  }
});

juggle.once(Event.MESSAGE_REMOVED, (notify) => {
  console.log('remove', notify);
  if (conversationTools.isSameConversation(notify, state)) {
    let { messages } = notify;
    utils.forEach(messages, (item) => {
      let index = utils.find(state.messages, (msg) => {
        return utils.isEqual(msg.messageId, item.messageId)
      });
      state.messages.splice(index, 1);
    });
  }
});

juggle.once(Event.MESSAGE_RECALLED, (notify) => {
  if (conversationTools.isSameConversation(notify, state)) {
    let index = utils.find(state.messages, (msg) => {
      return utils.isEqual(msg.messageId, notify.content.messageId)
    });
    state.messages.splice(index, 1, {...notify, name: MessageType.RECALL_INFO});
  }
});

juggle.once(Event.MESSAGE_READ, (notify) => {
  if (conversationTools.isSameConversation(notify, state)) {
    let { messages } = notify;
    utils.forEach(messages, (result) => {
      let { messageId, readCount, unreadCount } = result;
      let index = utils.find(state.messages, (msg) => {
        return utils.isEqual(msg.messageId, messageId)
      });
      if (index > -1) {
        let _msg = state.messages[index] || {};
        if (conversationTools.isGroup(notify)) {
          utils.extend(_msg, {
            readCount,
            unreadCount,
            readPercent: messageUtils.getGroupReadPercent(result)
          });
        } else {
          utils.extend(_msg, { isRead: true });
        }
      }
    })
  }
});

emitter.$on(EVENT_NAME.SEND_MESSAGE, (msg) => {
  state.messages.unshift(msg);
});

let canscroll = true;
nextTick(() => {
  let { messages } = context.refs;
  messages.addEventListener("scroll", () => {
    if (canscroll) {
      let scrollTop = messages.scrollTop;
      // if (utils.isEqual(scrollTop, 0)) {
      if (scrollTop < 300) {
        canscroll = false;
        let message = state.messages[0];
        if (!message) {
          canscroll = true;
          return console.log('messages is empty')
        }
        let isFirst = false;
        conversationTools.getMessages(isFirst, () => {
          canscroll = true;
        }, state, props);
      }
    }
  });
})

emitter.$on(EVENT_NAME.ON_GROUP_MEMBER_ADDED, ({ members }) => {
  let { mentionMembers } = state;
  utils.forEach(members, (member) => {
    let _member = utils.clone(member);
    _member = utils.rename(_member, { 
      user_id: 'id',
      nickname: 'name',
      avatar: 'portrait'
    });
    mentionMembers.push(_member);
  });
});

emitter.$on(EVENT_NAME.ON_GROUP_MEMBER_REMOVED, ({ members }) => {
  let { mentionMembers } = state;
  utils.forEach(members, (member) => {
    let index = utils.find(mentionMembers, (_member) => {
      return utils.isEqual(_member.id, member.id);
    });
    mentionMembers.splice(index, 1);
  });
});

watch(() => props.conversation, (newConversation, oldConversation) => {
  let { conversationId, conversationType } = oldConversation;
  emit('ondraft', { conversationType, conversationId, draft: state.content });

  let draft = newConversation.draft || '';
  utils.extend(state, {
    currentConversation: newConversation,
    messages: [],
    content: draft,
    isShowMobileBack: true,
    isShowAside: false
  })
  onCancelReply();
  let isFirst = true;
  conversationTools.getMessages(isFirst, () => {
    scrollBottom();
  }, state, props);
})

conversationTools.getMessages(true, () => {
  scrollBottom();
}, state, props);

function scrollBottom() {
  nextTick(() => {
    let { messages } = context.refs;
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  });
}
function onPreviewImage(image) {
  let messages = state.messages;
  let images = [];
  utils.forEach(messages, (message, i) => {
    if (utils.isEqual(message.name, MessageType.IMAGE)) {
      let { content: { url } } = message;
      images.push(url);
    }
  });
  let index = utils.find(images, (url) => {
    return utils.isEqual(url, image.url);
  });
  preview({ images, index });
}
function onMentionSelected(index) {
  let { mentionMembers, content, mentions } = state;
  let member = mentionMembers[index];
  mentions.push(member);
  content += `${member.name} `
  utils.extend(state, { isShowMention: false, selectMentionIndex: 0, mentions, content });
}
let isSending = false;
function onSend() {
  let { selectMentionIndex, mentions, isShowMention, content } = state
  if (utils.isEmpty(content)) {
    return;
  }

  if (isShowMention) {
    onMentionSelected(selectMentionIndex);
    return;
  }
  let { conversation } = props;

  if (isSending) {
    return;
  }
  isSending = true;

  let tid = utils.getUUID();
  let sender = juggle.getCurrentUser();
  let msg = {
    conversationType: conversation.conversationType,
    conversationId: conversation.conversationId,
    name: MessageType.TEXT,
    content: { content },
    isSender: true,
    tid,
    sender,
  };
  let { currentReplyMessage } = state;
  if(!utils.isEmpty(currentReplyMessage)){
    utils.extend(msg, { referMsg: currentReplyMessage });
  }
  if (conversationTools.isGroup(state.currentConversation)) {
    let members = [];
    let mentionType = -1;

    let newContent = content;
    utils.forEach(mentions, (mention) => {
      let name = `@${mention.name} `;
      if (utils.isInclude(content, name)) {
        if (!mention.isAll) {
          members.push(mention);
        }
        // 实际发送消息时不携带 @ 文本，各端通过标识拼接
        newContent = newContent.replace(name, '');
      }
    });
    let isMentionSomeone = members.length > 0;
    if (isMentionSomeone) {
      mentionType = MentionType.SOMEONE
    }
    let isMentionAll = mentions.filter((mention) => {
      return mention.isAll;
    }).length > 0;

    if (isMentionAll) {
      mentionType = MentionType.ALL;
    }
    if (isMentionAll && isMentionSomeone) {
      mentionType = MentionType.ALL_SOMEONE;
    }
    if (mentionType > -1) {
      utils.extend(msg, { mentionInfo: { mentionType: mentionType, members }, content: { content: newContent }, readCount: 0, unreadCount: 1 });
    }
  }
  
  utils.extend(state, { content: '', mentions: [] })
  
  state.draft = '';
  emit('ondraft', { conversationType: conversation.conversationType, conversationId: conversation.conversationId, draft: '' });
  
  onShowEmoji(false);
  scrollBottom();
  juggle.sendMessage(msg,  {
    onbefore: (message) => {
      message.sentTime = Date.now();
      message.sentState = SentState.SENDING;
      message.streamMsg = { isEnd: false, streams: [] };
      state.messages.unshift(message);
    }
  }).then(({ sentTime, messageId }) => {
    utils.extend(msg, { sentTime, messageId });
    isSending = false;
    let index = utils.find(state.messages, (m) => { return utils.isEqual(m.tid, msg.tid)});
    let _msg = state.messages[index];
    if(_msg){
      utils.extend(_msg, { sentTime, messageId, sentState: SentState.SUCCESS })
    }
    console.log('send successfully', msg);
    onCancelReply();
  }, ({ error }) => {
    console.log(error);
    let index = utils.find(state.messages, (m) => { return utils.isEqual(m.tid, msg.tid)});
    let _msg = state.messages[index];
    if(_msg){
      utils.extend(_msg, { sentState: SentState.FAILED });
    }
    context.proxy.$toast({ text: `消息发送失败: ${error.code}`, icon: 'error' });
    isSending = false;
  });
}
function onInputBlur() {
  
}
function onFileClick(e){
  e.target.parentNode.children[1].click()
}
function onFileChange(e) {
  let file = e.target.files[0];
  let { conversation: { conversationId, conversationType } } = props;
  let message = {
    conversationType: conversationType,
    conversationId: conversationId,
    isSender: true,
    sender: juggle.getCurrentUser(),
    name: MessageType.FILE,
    percent: 0,
    tid: utils.getUUID(),
  };
  let callback = () => {
    e.target.value = '';
  };
  if(utils.isEqual(file.type, 'video/mp4')) {
    return conversationTools.sendVideo(file, message, callback, state);
  }
  if(utils.isInclude(['image/png', 'image/jpeg'],file.type)) {
    return sendImage(e);
  }
  conversationTools.sendFile(file, message, callback, state);
}
function sendImage(e) {
  let file = e.target.files[0];
  let { conversation: { conversationId, conversationType } } = props;
  let url = URL.createObjectURL(file);

  let message = {
    conversationType: conversationType,
    conversationId: conversationId,
    isSender: true,
    sender: juggle.getCurrentUser(),
    name: MessageType.IMAGE,
    percent: 0,
    localUrl: url,
    tid: utils.getUUID()
  };

  var img = new Image();
  img.src = url;
  img.onload = function () {
    let content = { file, height: img.height, width: img.width, type: file.type };
    utils.extend(message, { content });

    juggle.sendImageMessage(message, {
      onbefore: (msg) => {
        state.messages.unshift(msg);
      },
      onprogress: ({ percent }) => {
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
      e.target.value = '';
    }, (error) => {
      console.log(error)
    })
  }

}
function onRecall(message) {
  juggle.recallMessage(message).then((msg) => {
    console.log('recall message successfully', msg);
    let index = utils.find(state.messages, (_msg) => {
      return utils.isEqual(_msg.messageId, msg.content.messageId)
    });
    state.messages.splice(index, 1, msg);
  }, (error) => {
    console.log(error);
  });
}
function onModifyText({ message, content }) {
  utils.extend(message, {
    content: { content },
    isUpdated: true
  });
  let msg = {
    conversationType: message.conversationType,
    conversationId: message.conversationId,
    messageId: message.messageId,
    sentTime: message.sentTime,
    content: { content },
    tid: message.tid,
  };
  juggle.updateMessage(msg).then(() => {
    console.log('update message successfully.')
  }, (error) => {
    console.log(error)
  });
}

function onInputDown() {
  conversationTools.updateMentionMember('down', state);
  state.draft = state.content;
}
function onInputUp() {
  conversationTools.updateMentionMember('up', state);
}
function onInputEsc() {
  utils.extend(state, { isShowMention: false, isShowTransfer: false });
}
function onHideBack() {
  emit('onback', {});
  state.isShowMobileBack = false;
}
function onShowAside() {
  let { isShowAside } = state;
  utils.extend(state, { isShowAside: !isShowAside })
}
function onShowTransfer({ type }) {
  state.msgOpType = type;
  onCancelTransfer(true);
}
function onCancelTransfer(isShow){
  utils.forEach(state.transferMsgs, (msg) => {
    msg.isSelected = false;
  });
  utils.extend(state, { isShowTransfer: isShow, transferMsgs: [] });
}
function onCancelTransferModal(){
  utils.extend(state, { isShowTransferMember: false });
}
function onConfirmTranser({ conversations }){
  let { transferMsgs, transferType } = state;
  conversationTools.transfer(transferType, conversations, transferMsgs, state);
  onCancelTransferModal();
  onCancelTransfer(false);
}
function onTransfer({ type }){
  let { transferMsgs } = state;
  if(utils.isEmpty(transferMsgs)){
    return onCancelTransfer(false);
  }
  if(utils.isEqual(TRANSFER_TYPE.DELETE, type)){
    removeMessages(transferMsgs);
  }else{
    utils.extend(state, { isShowTransferMember: true, transferType: type });
  }
}
function removeMessages(msgs){
  let _msgs = utils.map(msgs, (msg) => {
    let { conversationId, conversationType, tid, messageId, messageIndex, sentTime } = msg;
    return { conversationId, conversationType, tid, messageId, messageIndex, sentTime };
  });
  console.log(_msgs)
  juggle.removeMessages(_msgs).then(() => {
    utils.forEach(_msgs, (msg) => {
      let index = utils.find(state.messages, (_msg) => {
        return utils.isEqual(_msg.tid, msg.tid);
      });
      if(index > -1){
        state.messages.splice(index, 1);
      }
    });
  });
  onCancelTransfer(false);
}
function onSelected(message){
  if(!state.isShowTransfer){
    return;
  }
  let { isSelected } = message;
  isSelected = !isSelected;
  message.isSelected = isSelected;
  if(isSelected){
    state.transferMsgs.push(message);
  }else{
    let index = utils.find(state.transferMsgs, (msg) => {
      return utils.isEqual(message.messageId, msg.messageId)
    });
    state.transferMsgs.splice(index, 1);
  }
}
function onMergeDetail(message){
  utils.extend(state, { currentMergeMessage: message });
}
function onCancelMergeDetail(){
  utils.extend(state, { currentMergeMessage: {} });
}
function onCancelReply(){
  utils.extend(state, { currentReplyMessage: {}, isShowReply: false });
}
function onReply(message){
  let { messageInput } = context.refs;
  utils.extend(state, { currentReplyMessage: message, isShowReply: true });
  messageInput.focus();
}
function onReaction(reaction){
  let { text, message } = reaction;
  let { conversationId, conversationType } = state.currentConversation;
  let { messageId } = message;

  message.reactions = message.reactions || {};

  let list = message.reactions[text] || [];
  let user = Storage.get(STORAGE.USER_TOKEN);
  let index = utils.find(list, (reaction) => {
    return reaction.value == user.id;
  });
  let isRemove = index > -1;
  if(isRemove){
    list.splice(index, 1);
    juggle.removeMessageReaction({ conversationType, conversationId, messageId, reactionId: text }).then(() => {
      console.log('remove message reaction successfully.')
    });
  }else{
    list.push({ key: text, value: user.id, user });
    juggle.addMessageReaction({ conversationType, conversationId, messageId, reactionId: text }).then(() => {
      console.log('add message reaction successfully.')
    });
  }
  if(utils.isEqual(list.length, 0)){
    delete message.reactions[text];
  }else{
    message.reactions[text] = list;
  }
}
function onPaste(){
  if(typeof JuggleIMDesktop != 'undefined'){
    var img = JuggleIMDesktop.readImage();
    if(!img.isEmpty()){
      let previewUrl = img.toDataURL();
      let imgData = img.toPNG();
      onShowImgSender({ previewUrl, imgData });
    }
  }
}
function onShowEmoji(isShow){
  state.isShowEmoji = isShow;
}
function onChoiceEmoji(emoji){
  state.content += emoji.text;
  inputFocus();
}
function onShowImgSender(img){
  state.imgSender = img;
}
function onConfirmImgSender(){
  let { imgSender } = state;
  let file = new window.File([imgSender.imgData], 'screenshot.png', { type: 'image/png' });
  let e = { target: { files: [file] } };
  sendImage(e);
  onShowImgSender({});
}
function getMembers() {
  let { conversationType, conversationId, conversationTitle, conversationPortrait } = state.currentConversation;
  if (utils.isEqual(conversationType, ConversationType.PRIVATE)) {
    utils.extend(state, { members: [{ id: conversationId, name: conversationTitle, portrait: conversationPortrait }] })
    return;
  }
  Group.get({ id: conversationId }, (result) => {
    
    state.group = result;
    let { group_mute } = result.group_management || {};
    state.isShowGroupMute = !!group_mute;
    let { members } = result;
    let mentionMembers = [
      { id: 'all', val: '@', isActive: true, name: '所有人', portrait: '', isAll: true }
    ];
    members = utils.map(members, (member) => {
      let { user_id: id, nickname: name, avatar: portrait } = member;
      let item = { id, name, portrait };
      if(!portrait){
        item.portrait = common.getTextAvatar(name, { height: 60, width: 60 });
      }
      mentionMembers.push(item);
      return item;
    });
    utils.extend(state, { members, mentionMembers });
  });
}

function onShowCall(isShow, mediaType){
  let user = juggle.getCurrentUser();
  let { currentConversation } = state;
  let members = [{ id: user.id, name: user.name, portrait: user.portrait }];
  let isMulti = conversationTools.isGroup(currentConversation);
  if(!isMulti){
    members.push({ id: currentConversation.conversationId, name: currentConversation.conversationTitle, portrait: currentConversation.conversationPortrait },);
  }
  emitter.$emit(EVENT_NAME.ON_SHOW_CALL_DIALOG, { isShow, members, isCall: true, mediaType, isMulti });
}

getMembers();

watch(() => state.currentConversation, () => {
  getMembers();
});

watch(() => props.conversation.conversationTitle, () => {
  onCancelTransfer(false)
  if(!utils.isMobile()){
    inputFocus()
  }
});

nextTick(() => {
  if(!utils.isMobile()){
    inputFocus()
  }
})

function inputFocus(){
  let { messageInput } = context.refs;
  messageInput.focus();
}
function onResendMessage({ message }){
  let index = utils.find(state.messages, (m) => { return utils.isEqual(m.tid, message.tid)});
  let _msg = state.messages[index];
  juggle.sendMessage(message,  {
    onbefore: () => {
      let _msg = state.messages[index];
      _msg.sentState = SentState.SENDING;      
    }
  }).then(({ sentTime, messageId }) => {
    if(_msg){
      utils.extend(_msg, { sentTime, messageId, sentState: SentState.SUCCESS })
    }
    console.log('re send successfully', _msg);
  }, ({ error }) => {
    if(_msg){
      utils.extend(_msg, { sentState: SentState.FAILED });
    }
    context.proxy.$toast({ text: `消息发送失败: ${error.code}`, icon: 'error' });
  });
}
function onClearMessages(){
  emit('onclearmsg', props.conversation);
}
function onSetConversationTop(isTop){
  emit('ontop', props.conversation, isTop);
}
function onConversationDisturb(){
  emit('ondisturb', props.conversation);
}
function onQuitGroup(){
  emit('onquitgroup', props.conversation);
}
function onBanGroup(isMute){
  state.isShowGroupMute = isMute;
  state.group.group_management.group_mute = isMute;
}
watch(() => state.content, (val) => {
  let str = val.split('')[val.length - 1]
  if (conversationTools.isGroup(state.currentConversation) && utils.isEqual(str, '@')) {
    utils.extend(state, { isShowMention: true });
  }else{
    utils.extend(state, { isShowMention: false });
  }
  if (utils.isEmpty(val)) {
    onInputEsc();
  }
});

</script>
<template>
  <div class="tyn-main tyn-chat-content aside-collapsed"
    :class="{ 'main-shown': state.isShowMobileBack && utils.isMobile() }">
    <div class="tyn-chat-head">
      <ul class="tyn-list-inline d-md-none ms-n1">
        <li>
          <button class="btn btn-icon btn-md btn-pill btn-transparent js-toggle-main wr wr-left"
            @click="onHideBack"></button>
        </li>
      </ul>
      <div class="tyn-media-group">
        <div class="tyn-media tyn-size-md tyn-conver-avatar" :style="{ 'background-image': 'url(' + props.conversation.conversationPortrait + ')' }">
        </div>
        
        <div class="tyn-media-col">
          <div class="tyn-media-row">
            <h6 class="name">
              {{ props.conversation.conversationTitle }}
            </h6>
          </div>
          <!-- <div class="tyn-media-row has-dot-sap">
            <span class="meta">Active</span>
          </div> -->
        </div>
      </div>
      <ul class="tyn-list-inline gap gap-3 ms-auto">
        <li v-if="!conversationTools.isGroup(state.currentConversation)"><button class="btn btn-icon btn-light wr wr-rtc-mic jg-op-icon" @click="onShowCall(true, MediaType.AUDIO)"></button></li>
        <li><button class="btn btn-icon btn-light wr wr-rtc-camera jg-op-icon" @click="onShowCall(true, MediaType.VIDEO)"></button></li>
        <li><button class="btn btn-icon btn-light wr wr-more-dot" @click="onShowAside"></button></li>
      </ul>
    </div>
    <div class="tyn-chat-body js-scroll-to-end" ref="messages">
      <WithoutMessage v-if="state.isFinished"></WithoutMessage>
      <div class="tyn-reply">
        <div v-for="message in state.messages" :key="message.messageId">
          <TimelineMessage v-if="message.name == 'notify'" :message="message"></TimelineMessage>
          <RecallMessage v-else-if="message.name == MessageType.RECALL_INFO" :message="message"></RecallMessage>
          <GroupNtfMessage v-else-if="message.name == MSG_NAME.GROUP_NTF" :message="message"></GroupNtfMessage>
          <FriendNtfMessage v-else-if="message.name == MSG_NAME.FRIEND_NTF" :message="message"></FriendNtfMessage>
          <div class="tny-conent-msg" v-else>
            <span class="tyn-transfer wr" v-if="state.isShowTransfer" :class="{'wr-success-square': message.isSelected, 'wr-square': !message.isSelected}" @click="onSelected(message)"></span>
            <div class="tyn-reply-item" :class="[message.isSender ? 'outgoing' : 'ingoing', state.isShowTransfer ? 'tny-message' : '']"  @click="onSelected(message)">
              <Text v-if="utils.isEqual(message.name, MessageType.TEXT)" :message="message" @onrecall="onRecall"
                @onmodify="onModifyText" @ontransfer="onShowTransfer" @onreply="onReply" @onreaction="onReaction" @onresend="onResendMessage"></Text>
              <ImageMessage v-else-if="utils.isEqual(message.name, MessageType.IMAGE)" :message="message"
                @onrecall="onRecall" @onpreview="onPreviewImage" @ontransfer="onShowTransfer" @onreply="onReply"  @onreaction="onReaction"></ImageMessage>
              <File v-else-if="utils.isEqual(message.name, MessageType.FILE)" :message="message" 
                    @onrecall="onRecall" @ontransfer="onShowTransfer" @onreply="onReply" @onreaction="onReaction">
              </File>
              <Video v-else-if="utils.isEqual(message.name, MessageType.VIDEO)" :message="message"
                @onrecall="onRecall" @ontransfer="onShowTransfer" @onreply="onReply" @onreaction="onReaction"></Video>
              <Merge v-else-if="utils.isEqual(message.name, MessageType.MERGE)" :message="message"
                @onrecall="onRecall" @ondetail="onMergeDetail" @ontransfer="onShowTransfer" @onreply="onReply" @onreaction="onReaction"></Merge>
              <Call1v1FinishedMessage v-else-if="utils.isEqual(message.name, MessageType.CALL_1V1_FINISHED)" :message="message"></Call1v1FinishedMessage>
              <StreamText v-else-if="utils.isEqual(message.name, MessageType.STREAM_TEXT)" :message="message"></StreamText>
              <Known v-else :message="message"></Known>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tyn-chat-form">
      <Mention :is-show="state.isShowMention" :members="state.mentionMembers" @onselected="onMentionSelected" :index="state.selectMentionIndex"/>
      <Reply :is-show="state.isShowReply" @oncancel="onCancelReply" :message="state.currentReplyMessage"></Reply>
      <Emoji :is-show="state.isShowEmoji" @onhide="onShowEmoji(false)" @onemit="onChoiceEmoji"></Emoji>
      <div class="tyn-chat-form-enter tyn-conversation-input">
        <ul class="tyn-list-inline me-n2 my-1 tyn-chat-file">
          <li class="d-sm-block">
            <div class="btn btn-icon btn-light btn-md btn-pill wr wr-huixing tyn-input-file" @click="onFileClick"></div>
            <input type="file" style="display: none;"
              @change="onFileChange" />
          </li>
        </ul>
        <input  class="tyn-chat-form-input" v-model="state.content" @keydown.enter="onSend()" :disabled="state.isShowGroupMute" @keydown.esc="onInputEsc"
          @keydown.up.prevent="onInputUp" @keydown.down.prevent="onInputDown" @paste="onPaste" placeholder="Write a message" ref="messageInput"/>
        <ul class="tyn-list-inline me-n2 my-1">
          <li class="d-sm-block">
            <div type="file" class="btn btn-icon btn-light btn-md btn-pill wr wr-smile j-pointer" @click="onShowEmoji(true)" ></div>
          </li>
          <li class="d-sm-block tyn-input-block">
            <button :class="{'tyn-chat-has-content': state.content.length > 0}" class="btn btn-icon btn-light btn-md btn-pill  wr wr-send j-pointer" @click="onSend()"></button>
          </li>
        </ul>
      </div>
      <Transfer :is-show="state.isShowTransfer" :op-type="state.msgOpType" @oncancel="onCancelTransfer(false)" @ontransfer="onTransfer"></Transfer>
      <div class="jg-group-ban" v-if="state.isShowGroupMute">群组已禁言</div>
    </div>
    <ConversationAsider :is-show="state.isShowAside" :conversation="props.conversation" :members="state.members" :group="state.group" 
      @ontop="onSetConversationTop" 
      @ondisturb="onConversationDisturb"
      @onclearmsg="onClearMessages" 
      @onquitgroup="onQuitGroup"
      @onbangroup="onBanGroup"
      @oncancel="onShowAside"
      ></ConversationAsider>
    <ModalTransfer :is-show="state.isShowTransferMember" @oncancel="onCancelTransferModal" @onconfirm="onConfirmTranser"></ModalTransfer>
    <ModalMergeMsgs :is-show="!utils.isEmpty(state.currentMergeMessage)" :message="state.currentMergeMessage" @oncancel="onCancelMergeDetail"></ModalMergeMsgs>
    <ModalImgSender :is-show="!utils.isEmpty(state.imgSender)" :img="state.imgSender" :conversation="state.currentConversation" @oncancel="onShowImgSender({})" @onconfirm="onConfirmImgSender"></ModalImgSender>
  </div>
</template>