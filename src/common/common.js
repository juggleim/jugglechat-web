import utils from "./utils";
import { User, Group, Friend } from "../services/index";
import html2canvas from 'html2canvas';
import im from './im';
import { IGNORE_CONVERSATIONS, FILE_TYPE, ASIDE_MENU_TYPE, STORAGE } from "../common/enum"
import languages from "../i18n/i18n";
import Storage from "./storage";

import  MarkdownIt from 'markdown-it';
import { emojis } from "./emoji";
import Graphemer from "graphemer";

function isElementTop(message){
  var chatNode = document.querySelector('.tyn-chat-body');
  var messageNode = document.querySelector(`div[messageid="${message.messageId}"]`);
  if(!messageNode){
    messageNode = document.querySelector(`div[messageid="${message.tid}"]`);
  }
  let num = chatNode.offsetTop-messageNode.getBoundingClientRect().bottom;
  return num > -300;
}
function isConversationElementTop(conversation){
  var chatNode = document.querySelector('.tyn-aside-list');
  var node = chatNode.querySelector(`li[uid="${conversation.conversationType}_${conversation.conversationId}"]`);
  let num = chatNode.offsetTop-node.getBoundingClientRect().bottom;
  return num > -200;
}

function uploadBase64(str, callback){
  User.getFileToken({ file_type: FILE_TYPE.IMAGE, ext: 'png' }).then(({ code, data }) => {
    fetch(str).then((res) => {
      return res.blob()
    }).then((blob) => {
      let { OssOf: { PreSignResp: { url } }} = data;
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange=function(){
        if (utils.isEqual(xhr.readyState, 4)){
          url = url.split('?')[0]
          callback(url);
        }
      }
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', '');
      let file = new File([blob], 'avatar.png', { type: 'image/png' });
      xhr.send(file);
    });
  });
}
/* 
let groupAvatars = [
  { avatar: 'https://file.lwoowl.cn/36dc-db4c.png?attname=36dc-db4c.png' },  
];
common.createGroupAvatar(groupAvatars, ({url}) => {
  console.log(url)
})
*/
function createGroupAvatar(members, callback){
  let memberLen = members.length;
  let parent = document.createElement('div');
  parent.classList = ['tyn-group-avatars'];
  parent.id = 'group_avatar_temp';
  parent.style.height = '100px';
  parent.style.width = '100px';
  utils.forEach(members, (member) => {
    let size = memberLen < 5 ? 45 : 28;
    let child = document.createElement('div');
    child.classList = ['tyn-group-avatar'];
    child.style.backgroundImage = `url(${member.avatar || member.portrait})`;
    child.style.height = `${size}%`;
    child.style.width = `${size}%`;
    parent.appendChild(child);
  });
  document.body.appendChild(parent);
  html2canvas(parent, { 
    useCORS: true,
  }).then(canvas => {
    let url = canvas.toDataURL('image/png', 1);
    document.body.removeChild(parent);
    uploadBase64(url, (avatar) => {
      callback(avatar);
    })
  });
}

function getConversationInfo(params, callback){
  let { type, id } = params;
  let juggle = im.getCurrent();
  let { ConversationType } = juggle;
  let isGroup = utils.isEqual(Number(type), ConversationType.GROUP);

  let isBot = utils.isInclude(id, 'botid');

  if(isBot){
    return Friend.getBots({ count: 50 }).then(result => {
      let { data = {}  }  = result;
      let { items } = data;
      items = items || [];
      let index = utils.find(items, (item) => {
        return utils.isEqual(item.bot_id, id);
      });
      let info = items[index] || { nickname: '', avatar: getAvatar(id) };
      callback(info);
    });
  }
  if(isGroup){
    return Group.get(params, callback);
  }
  if(!isGroup){
    Friend.get(params, callback);
  }
}

function htmlToContent(content){
  return content.replace(/<[^>]+>/gi, '');
}
function calcSize(params, patch = 20){
  let { width, height } = params;
  let maxWidth = 270;
  let maxHeight = 240;
  if(utils.isMobile()){
    maxWidth = 240;
  }
  width = width || maxWidth;
  height = height || maxHeight;

  let isWidth = true;
  if(height > width){
    isWidth = false;
  }

  let ratio = 1;
  if(width > maxWidth && isWidth){
    ratio = maxWidth / width;
  }

  if( height > maxHeight && !isWidth){
    ratio = maxHeight / height;
  }
  width = width * ratio;
  height = height * ratio + patch;
  return { width, height }
}
function formatTags(tags){
  let tagIcons = {
    jg_all: 'wr-mg-msg',
    jg_mentionme: 'wr-mg-mention',
    jg_private: 'wr-mg-user',
    jg_unread: 'wr-mg-unread',
    jg_group: 'wr-mg-group',
  };
  // let groups = utils.map(tags, (tag) => {
  //   let icon = tagIcons[tag.id] || 'wr-mg-tag';
  //   let isInner = tag.type > 0;
  //   let isActive = utils.isEqual(tag.id, 'jg_all');
  //   utils.extend(tag, { icon, isActive, isInner });
  //   return tag;
  // });

  //暂时只保留全部会话和自定义会话，和服务端约定后可删除
  let TAG_i18n = i18n().MAIN.TAG;
  let groups = [];
  utils.forEach(tags, (tag) => {
    if(!tagIcons[tag.id]){
      let icon = 'wr-mg-tag';
      let isInner = tag.type > 0;
      utils.extend(tag, { icon, isActive: false, isInner, type: tag.type});
      groups.push(tag);
    }
  });
  groups.unshift({ id: 'jg_all', name: TAG_i18n.CHAT, icon: 'wr-mg-msg', isActive: true, isInner: true})
  return groups;
}

function getConversationTime(sentTime) {
  let str = utils.getCurrentTime();
  let current = new Date(str);
  let time = utils.formatTime(sentTime, "MM-dd hh:mm");
  if (sentTime > current) {
    time = utils.formatTime(sentTime, "hh:mm");
  }
  return time;
}
function formatMention(conversation) {
  let { mentions = {} } = conversation;
  let f_mentionContent = "";
  if (mentions.isMentioned) {
    f_mentionContent = `<span class="jg-warn">${i18n().UI.MENTION_ME}</span>`;
  }
  return f_mentionContent;
}
function formatSeconds(times) {
  var hh = parseInt(times / 60 / 60 );
  hh = hh < 10 ? '0' + hh : hh;
  var mm = parseInt(times / 60 % 60);
  mm = mm < 10 ? '0' + mm : mm;
  var ss = parseInt(times % 60);
  ss = ss < 10 ? '0' + ss : ss;
  let seconds =  mm + ':' + ss;
  return seconds;
}
function filterIgnoreConversations(conversations){
  return utils.filter(conversations, (item) => {
    return !utils.isInclude(IGNORE_CONVERSATIONS, item.conversationId);
  });
}

let md = MarkdownIt({ breaks: true });
function formatMarkdown(content){
  return md.render(content);
}
function purify(content){
	return content.replace(/</g,'&lt;');
}
function mentionShortFormat(message){
  let juggle = im.getCurrent();
  let { MentionType } = juggle;
  
	let { mentionInfo, content: { content } } = message;
	content = purify(content);
	if(!mentionInfo){
		return content;
	}
	
	let { mentionType, members } = mentionInfo;
	
	let isAll = utils.isEqual(MentionType.ALL, mentionType);
	if(isAll || utils.isEqual(MentionType.ALL_SOMEONE, mentionType)){
		content = utils.templateFormat(content, { all: `<span class="jg-mention-msg-name">@${i18n().UI.EVERYONE}</span>` });
	}
	let memberMap = {};
	utils.forEach(members, (member) => {
		memberMap[member.id] = `<span class="jg-mention-msg-name">@${member.name || member.id}</span>`;
	});
	content = utils.templateFormat(content, memberMap);
	return content;
}
function mentionToText(message){
  let juggle = im.getCurrent();
  let { MentionType } = juggle;
	
	let { mentionInfo, content: { content } } = message;
	content = purify(content);
	if(!mentionInfo){
		return content;
	}
	
	let { mentionType, members } = mentionInfo;
	
	let isAll = utils.isEqual(MentionType.ALL, mentionType);
	if(isAll ||  utils.isEqual(MentionType.ALL_SOMEONE, mentionType)){
		content = utils.templateFormat(content, { all: `@${i18n().UI.EVERYONE} ` });
	}
	let memberMap = {};
	utils.forEach(members, (member) => {
		memberMap[member.id] = `@${member.name} `;
	});
	content = utils.templateFormat(content, memberMap);
	return content;
}
var splitter = new Graphemer();
function isShowStaker(message){
	let { content: { content } } = message;
	let list = splitter.splitGraphemes(content);
	let showCount = 2;
	let matchCount = 0;
	let isShow = false;
	if(list.length > showCount){
		return isShow;
	}
	utils.forEach(list, (str) => {
		let isMatch = utils.isHighInclude(emojis, (emoji) => {
			return utils.isEqual(str, emoji.emoji);
		})
		if(isMatch || isEmoji(str)){
			matchCount += 1;
		}
	});
	return matchCount > 0 && matchCount <= showCount;
}
function splitGraphemes(content){
	return splitter.splitGraphemes(content)
}
function isEmoji(char) {
  let code = char.codePointAt(0);
  return (code >= 0x1F600 && code <= 0x1F64F) || // 常用表情符号范围
         (code >= 0x2600 && code <= 0x26FF) || // 杂项符号范围
         (code >= 0x2700 && code <= 0x27BF) || // 标点符号范围
         (code >= 0xFE00 && code <= 0xFE0F) || // 变体选择器范围
         (code >= 0x1F900 && code <= 0x1F9FF); // 补充表情符号范围
}
function isGroup(message) {
  let juggle = im.getCurrent();
  let { ConversationType } = juggle;
  return utils.isEqual(message.conversationType, ConversationType.GROUP);
}

function i18n(){
  let current = Storage.get(STORAGE.APP_LANGUAGE);
  let key = current.value || 'en';
  return languages[key];
}

function errorText(code){
  return utils.templateFormat(i18n().UI.ERROR_CODE, { code });
}

function getSettingCards(){
  let USER_SETTING = i18n().USER_SETTING;
  return [
    { tag: 1, 
      menus: [ 
      { name: USER_SETTING.SETTING, icon: 'config', event: ASIDE_MENU_TYPE.USER_SETTING },
      { name: USER_SETTING.INFO_UPDATE, icon: 'operate', event: ASIDE_MENU_TYPE.USER_UPDATE },
      { name: USER_SETTING.FAVORITE, icon: 'fav', event: ASIDE_MENU_TYPE.USER_FAV },
      { name: USER_SETTING.QRCODE, icon: 'qrcode', event: ASIDE_MENU_TYPE.USER_QRCODE },
      { name: USER_SETTING.LANGUAGE, icon: 'translate', event: ASIDE_MENU_TYPE.LANGUAGE },
      ] 
    },
    { tag: 2, 
      menus: [ 
      { name: USER_SETTING.ACCOUNT, icon: 'adduser', event: ASIDE_MENU_TYPE.USER_ACCOUNT },
      ] 
    },
    { 
      tag: 3, 
      menus: [ 
      { name: USER_SETTING.USER_AGREEMENT, icon: 'config', event: ASIDE_MENU_TYPE.USER_AGREEMENT },
      { name: USER_SETTING.USER_PRIVACY, icon: 'operate', event: ASIDE_MENU_TYPE.USER_PRIVACY },
      ]
    },
    { tag: 10, 
      menus: [ 
      { name: USER_SETTING.LOGOUT, icon: 'logout', isWarn: true, event: ASIDE_MENU_TYPE.USER_LOGOUT },
      ] 
    },
  ]
}
export default {
  isElementTop,
  createGroupAvatar,
  getConversationInfo,
  htmlToContent,
  calcSize,
  formatTags,
  isConversationElementTop,
  getConversationTime,
  formatMention,
  formatSeconds,
  filterIgnoreConversations,
  formatMarkdown,
  purify,
  mentionShortFormat,
  mentionToText,
  isShowStaker,
  splitGraphemes,
  isGroup,
  i18n,
  errorText,
  getSettingCards
}
