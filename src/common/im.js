import JuggleChat from "../libs/juggleim-es-1.8.0";
import JuggleCall from "../libs/jugglecall-es-1.0.0";

// import JuggleChat from "jugglechat-websdk";
import { CONFIG } from "../config";
import utils from "./utils";
import { EVENT_NAME, MSG_NAME, STORAGE } from "../common/enum";
import emitter from "../common/emmit";
import Storage from "../common/storage";


let option = { appkey: CONFIG.appkey, upload: OSS, serverList: CONFIG.serverList };
let juggle = JuggleChat.init(option);
juggle.registerMessage([
  { name: MSG_NAME.GROUP_NTF,  isCount: true, isStorage: true },
  { name: MSG_NAME.FRIEND_NTF,  isCount: true, isStorage: true },
  { name: MSG_NAME.FRIEND_APPLY,  isCount: true, isStorage: true },
  { name: MSG_NAME.CONTACT_CARD,  isCount: true, isStorage: true },
])

let zg = new ZegoExpressEngine(CONFIG.rtcAppId);
zg.setLogConfig({ logLevel: 'disable' })
// zg.setDebugVerbose(false);
let client = juggle.install({ name: 'call' });
let juggleCall = JuggleCall.init({ client, engine: zg  });
let { CallEvent, CallFinishedReason } = JuggleCall;

function getCurrent(){
  return juggle;
}

function getRTCEngine(){
  return juggleCall;
}
function connect(user, callbacks){
  let { Event, ConnectionState, ErrorType } = juggle;
  if(juggle.isConnected()){
    let user = juggle.getCurrentUser();
    return  callbacks.success(user)
  }
  juggle.on(Event.STATE_CHANGED, ({ state }) => {
    if (ConnectionState.DISCONNECTED == state) {
      console.log('im is disconnected');
    }
    if (ConnectionState.CONNECTED == state) {
      let _user = Storage.get(STORAGE.USER_TOKEN);
      utils.extend(_user, user);
      Storage.set(STORAGE.USER_TOKEN, _user);
      callbacks.success(user);
    }
  });

  let { id, token } = user;
  juggle.connect({ userId: id, token }).then((user) => {}, () => {
    callbacks.error(juggle);
  });
}

function isConnected(){
  return juggle.isConnected();
}

function msgShortFormat(message){
  let { MessageType } = juggle;
  let { name, content, sender, isSender, mentionInfo } = message;
  let shortName = '[Unkown]'
  if(utils.isEqual(name, MessageType.TEXT)){
    shortName = content.content;
  }
  if(utils.isEqual(name, MessageType.FILE)){
    shortName = '[文件]';
  }
  if(utils.isEqual(name, MessageType.IMAGE)){
    shortName = '[图片]';
  }
  if(utils.isEqual(name, MessageType.VIDEO)){
    shortName = '[视频]';
  }
  if(utils.isEqual(name, MessageType.VOICE)){
    shortName = '[语音]';
  }
  if(utils.isEqual(name, MessageType.MERGE)){
    shortName = '[聊天记录]';
  }
  if(utils.isEqual(name, MSG_NAME.GROUP_NTF)){
    shortName = `[群通知]`;
  }
  if(utils.isEqual(name, MSG_NAME.FRIEND_NTF)){
    shortName = `[添加好友通知]`;
  }
  if(utils.isEqual(name, MSG_NAME.CONTACT_CARD)){
    shortName = `[名片消息]`;
  }
  if(utils.isEqual(name, MessageType.CALL_1V1_FINISHED)){
    shortName = `[音视频通话]`;
  }
  if(utils.isEqual(name, MessageType.STREAM_TEXT)){
    shortName = `[智能体消息]`;
  }
  if(utils.isEqual(name, MessageType.RECALL_INFO)){
    let label = isSender ? '你' : sender.name;
    shortName = `${label} 撤回了一条消息`;
  }
  shortName += ` ${mentionShortFormat(message).join(' ')}`;
 
  if(utils.isUndefined(name) || utils.isNull(name)){
    shortName = '';
  }

  return shortName;
}
function mentionShortFormat(message){
  let { MentionType } = juggle;
  let names = [];
  let { mentionInfo } = message;
  if(mentionInfo){
    let { members, mentionType } = mentionInfo;
    utils.forEach(members, (member) => {
      names.push(`@${member.name}`)
    });
    if(utils.isEqual(mentionType, MentionType.ALL) || utils.isEqual(mentionType, MentionType.ALL_SOMEONE)){
      names.push('@所有人');
    }
  }
  return names;
}
let { UnreadTag } = juggle;
function isUnreadTag(conversation){
  return conversation.unreadTag == UnreadTag.UNREAD;
}
export default {
  getCurrent,
  isConnected,
  connect,
  msgShortFormat,
  mentionShortFormat,
  isUnreadTag,
  CallEvent,
  CallFinishedReason,
  getRTCEngine,
}