import JuggleChat from "../libs/juggleim-es-1.8.1";
import JuggleCall from "../libs/jugglecall-es-1.0.0";

// import JuggleChat from "jugglechat-websdk";
import { CONFIG } from "../config";
import utils from "./utils";
import { EVENT_NAME, MSG_NAME, STORAGE } from "../common/enum";
import emitter from "../common/emmit";
import Storage from "../common/storage";
import common from "./common";


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
  let i18n = common.i18n();
  let { LAST_MSG } = i18n.MAIN;
  let { MessageType } = juggle;
  let { name, content, sender, isSender, mentionInfo } = message;
  let shortName = LAST_MSG.NOT_SUPPORT;
  if(utils.isEqual(name, MessageType.TEXT)){
    shortName = common.mentionShortFormat(message);
  }
  if(utils.isEqual(name, MessageType.FILE)){
    shortName = LAST_MSG.FILE;
  }
  if(utils.isEqual(name, MessageType.IMAGE)){
    shortName = LAST_MSG.IMAGE;
  }
  if(utils.isEqual(name, MessageType.VIDEO)){
    shortName = LAST_MSG.VIDEO;
  }
  if(utils.isEqual(name, MessageType.VOICE)){
    shortName = LAST_MSG.VOICE;
  }
  if(utils.isEqual(name, MessageType.MERGE)){
    shortName = LAST_MSG.MERGE;
  }
  if(utils.isEqual(name, MSG_NAME.GROUP_NTF)){
    shortName = LAST_MSG.GROUP_NTF;
  }
  if(utils.isEqual(name, MSG_NAME.FRIEND_NTF)){
    shortName = LAST_MSG.FRIEND_NTF;
  }
  if(utils.isEqual(name, MSG_NAME.CONTACT_CARD)){
    shortName = LAST_MSG.CARD;
  }
  if(utils.isEqual(name, MessageType.CALL_1V1_FINISHED)){
    shortName = LAST_MSG.CALL;
  }
  if(utils.isEqual(name, MessageType.STREAM_TEXT)){
    shortName = LAST_MSG.AGENT;
  }
  if(utils.isEqual(name, MessageType.RECALL_INFO)){
    let name = isSender ? i18n.COMMON.YOU : sender.name;
    shortName = utils.templateFormat(LAST_MSG.RECALL, { name });
  }
 
  if(utils.isUndefined(name) || utils.isNull(name)){
    shortName = '';
  }

  return shortName;
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
  isUnreadTag,
  CallEvent,
  CallFinishedReason,
  getRTCEngine,
}