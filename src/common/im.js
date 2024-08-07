import JuggleChat from "../libs/juggle.1.0.0.es";
import { CONFIG } from "../config";
import utils from "./utils";
import { EVENT_NAME, MSG_NAME, STORAGE } from "../common/enum";
import emitter from "../common/emmit";
import Storage from "../common/storage";

console.log(JuggleChat)

let juggle = JuggleChat.init({ appkey: CONFIG.appkey, upload: OSS });
juggle.registerMessage([
  { name: MSG_NAME.GROUP_NTF,  isCount: true, isStorage: true },
])

function getCurrent(){
  return juggle;
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
  });

  let { id, token } = user;
  juggle.connect({ userId: id, token }).then((user) => {
    let { code } = user;
    if(ErrorType.CONNECT_SUCCESS.code == code){
      let _user = Storage.get(STORAGE.USER_TOKEN);
      utils.extend(_user, user);
      Storage.set(STORAGE.USER_TOKEN, _user);
      callbacks.success(user);
    }
  }, () => {
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
    let { members, type } = mentionInfo;
    utils.forEach(members, (member) => {
      names.push(`@${member.name}`)
    });
    if(utils.isEqual(type, MentionType.ALL) || utils.isEqual(type, MentionType.ALL_SOMEONE)){
      names.push('@所有人');
    }
  }
  return names;
}
export default {
  getCurrent,
  isConnected,
  connect,
  msgShortFormat,
  mentionShortFormat,
}