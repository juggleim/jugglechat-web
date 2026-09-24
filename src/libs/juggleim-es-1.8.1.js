/*
* JuggleIM.js v1.8.1
* (c) 2022-2025 JuggleIM
* Released under the MIT License.
*/
const noop = () => {};
const isObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};
const isArray = arr => {
  return Object.prototype.toString.call(arr) === '[object Array]';
};
const isFunction = arr => {
  return Object.prototype.toString.call(arr) === '[object Function]';
};
const isString = str => {
  return Object.prototype.toString.call(str) === '[object String]';
};
const isBoolean = str => {
  return Object.prototype.toString.call(str) === '[object Boolean]';
};
const isUndefined = str => {
  return Object.prototype.toString.call(str) === '[object Undefined]';
};
const isNull = str => {
  return Object.prototype.toString.call(str) === '[object Null]';
};
const isNumber = str => {
  return Object.prototype.toString.call(str) === '[object Number]';
};
const _isNaN = str => {
  return isNaN(Number(str));
};
const stringify = obj => {
  return JSON.stringify(obj);
};
const parse = str => {
  let obj = {};
  try {
    obj = JSON.parse(str);
  } catch (e) {
    obj = str;
  }
  return obj;
};
const forEach = (obj, callback) => {
  callback = callback || noop;
  let loopObj = () => {
    for (var key in obj) {
      callback(obj[key], key, obj);
    }
  };
  var loopArr = () => {
    for (var i = 0, len = obj.length; i < len; i++) {
      callback(obj[i], i, obj);
    }
  };
  if (isObject(obj)) {
    loopObj();
  }
  if (isArray(obj)) {
    loopArr();
  }
};
const isEmpty = obj => {
  let result = true;
  if (isObject(obj)) {
    forEach(obj, () => {
      result = false;
    });
  }
  if (isString(obj) || isArray(obj)) {
    result = obj.length === 0;
  }
  if (isNumber(obj)) {
    result = obj === -1;
  }
  return result;
};
const rename = (origin, newNames) => {
  var isObj = isObject(origin);
  if (isObj) {
    origin = [origin];
  }
  origin = parse(stringify(origin));
  var updateProperty = function (val, key, obj) {
    delete obj[key];
    key = newNames[key];
    obj[key] = val;
  };
  forEach(origin, item => {
    forEach(item, (val, key, obj) => {
      var isRename = (key in newNames);
      (isRename ? updateProperty : noop)(val, key, obj);
    });
  });
  return isObject ? origin[0] : origin;
};
const extend = (destination, sources) => {
  sources = isArray(sources) ? sources : [sources];
  forEach(sources, source => {
    for (let key in source) {
      let value = source[key];
      if (!isUndefined(value)) {
        destination[key] = value;
      }
    }
  });
  return destination;
};
const Defer = Promise;
const deferred = callback => {
  return new Defer(callback);
};
const templateFormat = (tpl, data, regexp) => {
  if (!isArray(data)) {
    data = [data];
  }
  let ret = [];
  let replaceAction = object => {
    return tpl.replace(regexp || /\\?\{([^}]+)\}/g, (match, name) => {
      if (match.charAt(0) === '\\') return match.slice(1);
      return object[name] !== undefined ? object[name] : '{' + name + '}';
    });
  };
  for (let i = 0, j = data.length; i < j; i++) {
    ret.push(replaceAction(data[i]));
  }
  return ret.join('');
};
// 暂时支持 String
const isContain = (str, keyword) => {
  return str.indexOf(keyword) > -1;
};
const isEqual = (source, target) => {
  return source === target;
};
const Cache$1 = cache => {
  if (!isObject(cache)) {
    cache = {};
  }
  let set = (key, value) => {
    cache[key] = value;
  };
  let get = key => {
    return cache[key];
  };
  let remove = key => {
    delete cache[key];
  };
  let getKeys = () => {
    let keys = [];
    for (let key in cache) {
      keys.push(key);
    }
    return keys;
  };
  let clear = () => {
    cache = {};
  };
  return {
    set,
    get,
    remove,
    getKeys,
    clear
  };
};
const map = (arrs, callback) => {
  return arrs.map(callback);
};
const filter = (arrs, callback) => {
  return arrs.filter(callback);
};
const uniq = (arrs, callback) => {
  let newData = [],
    tempData = {};
  arrs.forEach(target => {
    let temp = callback(target);
    tempData[temp.key] = temp.value;
  });
  forEach(tempData, val => {
    newData.push(val);
  });
  return newData;
};
const some = (arrs, callback) => {
  return arrs.some(callback);
};
const toJSON = value => {
  return JSON.stringify(value);
};
const toArray = obj => {
  let arrs = [];
  forEach(obj, (v, k) => {
    arrs.push([k, v]);
  });
  return arrs;
};
const isInclude = (str, match) => {
  return str.indexOf(match) > -1;
};
const clone$1 = source => {
  return JSON.parse(JSON.stringify(source));
};
function Index() {
  let index = 0;
  this.add = () => {
    index += 1;
  };
  this.get = () => {
    return index;
  };
  this.reset = () => {
    index = 0;
  };
}
function Observer() {
  let observers = [];
  this.add = (observer, force) => {
    if (isFunction(observer)) {
      if (force) {
        return observers = [observer];
      }
      observers.push(observer);
    }
  };
  this.remove = observer => {
    observers = filter(observers, _observer => {
      return _observer !== observer;
    });
  };
  this.emit = data => {
    forEach(observers, observer => {
      observer(data);
    });
  };
}
function Prosumer() {
  let data = [],
    isConsuming = false;
  this.produce = res => {
    data.push(res);
  };
  this.consume = (callback, finished) => {
    if (isConsuming) {
      return;
    }
    isConsuming = true;
    let next = () => {
      let res = data.shift();
      if (isUndefined(res)) {
        isConsuming = false;
        finished && finished();
        return;
      }
      callback(res, next);
    };
    next();
  };
  this.isExeuting = function () {
    return isConsuming;
  };
}
const getBrowser = () => {
  let userAgent = navigator.userAgent;
  let name = '',
    version = '';
  if (/(Msie|Firefox|Opera|Chrome|Netscape)\D+(\d[\d.]*)/.test(userAgent)) {
    name = RegExp.$1;
    version = RegExp.$2;
  }
  if (/Version\D+(\d[\d.]*).*Safari/.test(userAgent)) {
    name = 'Safari';
    version = RegExp.$1;
  }
  return {
    name,
    version
  };
};
const getUUID = () => {
  return 'j' + 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};
const getProtocol = (url = '') => {
  if (typeof location == 'undefined') {
    location = {
      protocol: 'https:'
    };
  }
  let http = location.protocol;
  if (isEqual(http, 'file:')) {
    http = 'http:';
  }
  if (isInclude(url, 'https://')) {
    http = 'https:';
  }
  let wsMap = {
    'http:': 'ws:',
    'https:': 'wss:'
  };
  let ws = wsMap[http];
  return {
    http,
    ws
  };
};
const sort = (arrs, callback) => {
  const len = arrs.length;
  if (len < 2) {
    return arrs;
  }
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      if (callback(arrs[j], arrs[i])) {
        [arrs[i], arrs[j]] = [arrs[j], arrs[i]];
      }
    }
  }
  return arrs;
};
const quickSort = (arr, callback) => {
  if (arr.length < 2) {
    return arr;
  }
  let pivot = arr[0];
  let left = [];
  let right = [];
  for (let i = 1; i < arr.length; i++) {
    if (callback(arr[i], pivot)) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return [...quickSort(left, callback), pivot, ...quickSort(right, callback)];
};
const find = (arrs, callback) => {
  let len = arrs.length;
  let index = -1;
  for (let i = 0; i < len; i++) {
    let item = arrs[i];
    if (callback(item)) {
      index = i;
      break;
    }
  }
  return index;
};
const toObject = arrs => {
  let objs = {};
  forEach(arrs, (item = {}) => {
    let key = item.key;
    let value = item.value;
    objs[key] = value;
  });
  return objs;
};
const decodeBase64 = function (input) {
  let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let chr1, chr2, chr3;
  let enc1, enc2, enc3, enc4;
  let i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++));
    enc2 = _keyStr.indexOf(input.charAt(i++));
    enc3 = _keyStr.indexOf(input.charAt(i++));
    enc4 = _keyStr.indexOf(input.charAt(i++));
    chr1 = enc1 << 2 | enc2 >> 4;
    chr2 = (enc2 & 15) << 4 | enc3 >> 2;
    chr3 = (enc3 & 3) << 6 | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) {
      output += String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output += String.fromCharCode(chr3);
    }
  }
  output = decodeURIComponent(escape(output));
  return output;
};
const isContinuous = (numbers, key) => {
  numbers.sort((a, b) => {
    return a[key] - b[key];
  });
  for (let i = 0; i < numbers.length - 1; i++) {
    if (!isEmpty(numbers[i + 1][key])) {
      if (numbers[i + 1][key] !== numbers[i][key] + 1) {
        return false;
      }
    }
  }
  return true;
};
const isBase64 = str => {
  var regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  return regex.test(str);
};
function iterator(list, callback) {
  let next = () => {
    let item = list.splice(0, 1);
    if (isEmpty(item)) {
      return;
    }
    let isFinished = isEqual(list.length, 0);
    callback(item[0], next, isFinished);
  };
  next();
}
function formatTime(time, fmt = 'yyyy-MM-dd hh:mm:ss') {
  let date = new Date(time);
  var o = {
    "M+": date.getMonth() + 1,
    // 月份
    "d+": date.getDate(),
    // 日
    "h+": date.getHours(),
    // 小时
    "m+": date.getMinutes(),
    // 分
    "s+": date.getSeconds(),
    // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3),
    // 季度
    "S": date.getMilliseconds() // 毫秒
  };

  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  return fmt;
}
function isValidHMTime(timeStr) {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
}
function getRandoms(len) {
  return Array(len).fill(0).map(() => Math.floor(Math.random() * 10));
}
// input: groupBy([{a:1},{a:1}, {a:2}], ['a'])
// output: { 1: [{a:1},{a:1}], 2: [{a:2}] }
let groupBy = (arrs, keys) => {
  let obj = {};
  forEach(arrs, item => {
    let names = [];
    forEach(item, (v, k) => {
      if (isInclude(keys, k)) {
        names.push(v);
      }
    });
    let name = names.join('_');
    let _list = obj[name] || [];
    _list.push(item);
    obj[name] = _list;
  });
  return obj;
};
var utils = {
  Prosumer,
  Observer,
  isUndefined,
  isBoolean,
  isString,
  isObject,
  isArray,
  isFunction,
  stringify,
  parse,
  rename,
  extend,
  clone: clone$1,
  deferred,
  Defer,
  forEach,
  templateFormat,
  isContain,
  noop,
  Cache: Cache$1,
  map,
  filter,
  uniq,
  some,
  isEqual,
  isEmpty,
  toJSON,
  isInclude,
  isNull,
  isNumber,
  toArray,
  Index,
  getBrowser,
  getUUID,
  getProtocol,
  sort,
  find,
  quickSort,
  toObject,
  decodeBase64,
  isContinuous,
  isBase64,
  iterator,
  formatTime,
  isValidHMTime,
  getRandoms,
  groupBy,
  isNaN: _isNaN
};

function Emitter () {
  /*
  EmitterEvents = {
    name: [event1, event2, ...]
  }
  */
  let EmitterEvents = {};
  let EmitterOnceEvent = {};
  let on = (name, event) => {
    let events = EmitterEvents[name] || [];
    events.push(event);
    let eventObj = {};
    eventObj[name] = events;
    utils.extend(EmitterEvents, eventObj);
  };
  let once = (name, event) => {
    EmitterOnceEvent[name] = event;
  };
  let off = name => {
    delete EmitterEvents[name];
    delete EmitterOnceEvent[name];
  };
  let emit = (name, data) => {
    let events = EmitterEvents[name] || [];
    data = utils.isArray(data) ? data : [data];
    utils.forEach(events, event => {
      event(...data);
    });
    let event = EmitterOnceEvent[name] || utils.noop;
    event(...data);
  };
  let clear = () => {
    utils.forEach(EmitterEvents, (event, name) => {
      delete EmitterEvents[name];
    });
  };
  return {
    on,
    off,
    emit,
    clear,
    once
  };
}

let STORAGE = {
  PREFIX: 'suprjj_im',
  NAVI: 'navi',
  SYNC_CHATROOM_RECEIVED_MSG_TIME: 'sync_chatroom_received_msg_time',
  SYNC_CHATROOM_ATTR_TIME: 'sync_chatroom_attr_time',
  CLIENT_SESSION: 'jgim_client_session',
  CRYPTO_RANDOM: 'jg_crypto_randowm',
  //PC 端有同样的 KEY，如果修改 VALUE，需要一起修改
  SYNC_CONVERSATION_TIME: 'sync_conversation_time',
  SYNC_RECEIVED_MSG_TIME: 'sync_received_msg_time',
  SYNC_SENT_MSG_TIME: 'sync_sent_msg_time'
};
let HEART_TIMEOUT = 1 * 30 * 1000;
let SYNC_MESSAGE_TIME = 3 * 60 * 1000;
let CONNECT_ACK_INDEX = 'c_conn_ack_index';
let PONG_INDEX = 'c_pong_index';
let SIGNAL_NAME = {
  CMD_RECEIVED: 'cmd_inner_receive',
  CMD_CHATROOM_ATTR_RECEIVED: 'cmd_inner_chatroom_attr_receive',
  CMD_CHATROOM_DESTROY: 'cmd_inner_chatroom_destroy',
  CMD_SYNC_CONVERSATIONS_PROGRESS: 'cmd_inner_sync_conversations_progress',
  CMD_SYNC_CONVERSATION_FINISHED: 'cmd_inner_sync_conversations_finished',
  CMD_CONVERSATION_CHANGED: 'cmd_inner_conversation_changed',
  CONN_CHANGED: 'conn_inner_changed',
  CMD_SYNC_TAG_FINISHED: 'cmd_inner_sync_tags_finished',
  CMD_CHATROOM_EVENT: 'cmd_inner_chatroom_event',
  CMD_CHATROOM_REJOIN: 'cmd_inner_chatroom_rejoin',
  CMD_RTC_INVITE_EVENT: 'cmd_inner_rtc_invite_event',
  CMD_RTC_ROOM_EVENT: 'cmd_inner_rtc_room_event',
  CMD_STREAM_APPENDED: 'cmd_innter_stream_appended',
  CMD_STREAM_COMPLETED: 'cmd_innter_stream_completed',
  // 与下行信令进行匹配，在 io.js 中进行派发
  S_CONNECT_ACK: 's_connect_ack',
  S_DISCONNECT: 's_disconnect',
  S_PUBLICH_ACK: 's_publish_ack',
  S_QUERY_ACK: 's_query_ack',
  S_NTF: 's_ntf',
  S_CHATROOM_USER_NTF: 's_c_user_ntf',
  S_RTC_INVITE_NTF: 's_rtc_invite_ntf',
  S_RTC_ROOM_EVENT: 's_rtc_room_event_ntf',
  S_STREAM_EVENT: 's_stream_event',
  // PC 端自定义通知
  S_SYNC_CONVERSATION_NTF: 's_sync_conversation_ntf',
  S_PONG: 's_pong',
  CLIENT_CLEAR_MEMORY_CACHE: 'cmd_clear_memory_cache'
};
let PLATFORM = {
  WEB: 'Web',
  DESKTOP: 'PC'
};
let MSG_TOP_ACTION_TYPE = {
  ADD: 0,
  REMOVE: 1
};
let SIGNAL_CMD = {
  CONNECT: 0,
  CONNECT_ACK: 1,
  DISCONNECT: 2,
  PUBLISH: 3,
  PUBLISH_ACK: 4,
  QUERY: 5,
  QUERY_ACK: 6,
  QUERY_CONFIRM: 7,
  PING: 8,
  PONG: 9
};
let QOS = {
  YES: 1,
  NO: 0
};
let FUNC_PARAM_CHECKER = {
  CONNECT: [{
    name: 'token'
  }],
  SENDMSG: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'content'
  }, {
    name: 'name'
  }],
  INSERT_MESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'content'
  }, {
    name: 'name'
  }, {
    name: 'sentState'
  }, {
    name: 'sender',
    type: 'Object'
  }],
  GETMSGS: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  GETMSG: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageIds',
    type: 'Array'
  }],
  REMOVEMSG: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageId'
  }],
  CLEARMSG: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'time',
    type: 'Number'
  }],
  REMOVE_MSGS: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'sentTime',
    type: 'Number'
  }, {
    name: 'tid'
  }, {
    name: 'messageIndex'
  }],
  RECALLMSG: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageId'
  }, {
    name: 'sentTime'
  }],
  READMESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'sentTime',
    type: 'Number'
  }, {
    name: 'unreadIndex'
  }],
  GET_MESSAGE_READ_DETAILS: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageId'
  }],
  UPDATEMESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'tid'
  }, {
    name: 'sentTime'
  }, {
    name: 'messageId'
  }, {
    name: 'content'
  }],
  GET_MENTIOIN_MESSAGES: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  SEARCH_MESSAGES: [{
    name: 'keywords',
    type: 'Array'
  }],
  UPDATE_MESSAGE_ATTR: [{
    name: 'tid'
  }, {
    name: 'attribute',
    type: 'String'
  }],
  SET_MESSAGE_SEARCH_CONTENT: [{
    name: 'tid'
  }, {
    name: 'content',
    type: 'String'
  }],
  GET_FILE_TOKEN: [{
    name: 'type'
  }],
  SEND_FILE_MESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'content',
    type: 'Object'
  }],
  SEND_MERGE_MESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'title'
  }, {
    name: 'previewList',
    type: 'Array'
  }, {
    name: 'messages',
    type: 'Array',
    children: [{
      name: 'conversationType'
    }, {
      name: 'conversationId'
    }, {
      name: 'messageId'
    }, {
      name: 'sentTime'
    }, {
      name: 'messageIndex'
    }]
  }],
  GET_MERGE_MESSAGES: [{
    name: 'messageId'
  }],
  GET_FIRST_UNREAD_MSG: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  SUBSCRIBE_MESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  GETCONVERSATIONS: [{
    name: 'limit'
  }],
  GETCONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  MARK_UNREAD: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'unreadTag',
    type: 'Number'
  }],
  GET_TOTAL_UNREADCOUNT: [{
    name: 'ignoreConversations',
    type: 'Array',
    children: [{
      name: 'conversationType'
    }, {
      name: 'conversationId'
    }]
  }],
  SET_ALL_DISTURB: [{
    name: 'type'
  }
  // { name: 'timezone' }, 
  // { 
  //   name: 'times', 
  //   type: 'Array',
  //   children: [
  //     { name: 'start', type: 'String' },
  //     { name: 'end', type: 'String' },
  //   ]
  // }
  ],

  CLEARUNREADCOUNT: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'unreadIndex'
  }],
  SET_DRAFT: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'draft'
  }],
  GET_DRAFT: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  REMOVECONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  INSERTCONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  GET_CONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  MUTE_CONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'undisturbType'
  }],
  SET_TOP_CONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'isTop'
  }],
  UNTOP_CONVERSATION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  JOINCHATROOM: [{
    name: 'id',
    type: 'String'
  }],
  QUITCHATROOM: [{
    name: 'id',
    type: 'String'
  }],
  SET_CHATROOM_ATTRS: [{
    name: 'id',
    type: 'String'
  }, {
    name: 'attributes',
    type: 'Array',
    children: [{
      name: 'key'
    }, {
      name: 'value'
    }]
  }],
  REMOVE_CHATROOM_ATTRS: [{
    name: 'id',
    type: 'String'
  }, {
    name: 'attributes',
    type: 'Array',
    children: [{
      name: 'key'
    }]
  }],
  GET_CHATROOM_ATTRS: [{
    name: 'id',
    type: 'String'
  }, {
    name: 'attributes',
    type: 'Array',
    children: [{
      name: 'key'
    }]
  }],
  GET_ALL_CHATROOM_ATTRS: [{
    name: 'id',
    type: 'String'
  }],
  ADD_MSG_REACTION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageId'
  }, {
    name: 'reactionId',
    type: 'String'
  }],
  REMOVE_MSG_REACTION: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageId'
  }, {
    name: 'reactionId',
    type: 'String'
  }],
  TRANSLATE: [{
    name: 'sourceLang'
  }, {
    name: 'targetLang'
  }, {
    name: 'content',
    type: 'Object'
  }],
  SET_TOP_MESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }, {
    name: 'messageId'
  }],
  GET_TOP_MESSAGE: [{
    name: 'conversationType'
  }, {
    name: 'conversationId'
  }],
  ADD_FAVORITE_MESSAGE: [{
    name: 'messages',
    type: 'Array',
    children: [{
      name: 'conversationType'
    }, {
      name: 'conversationId'
    }, {
      name: 'senderId'
    }, {
      name: 'messageId'
    }]
  }],
  CREATE_CONVERSATION_TAG: [{
    name: 'id',
    type: 'String'
  }, {
    name: 'name',
    type: 'String'
  }],
  REMOVE_CONVERSATION_TAG: [{
    name: 'id',
    type: 'String'
  }],
  ADD_CONVERSATION_TO_TAG: [{
    name: 'id',
    type: 'String'
  }, {
    name: 'conversations',
    type: 'Array',
    children: [{
      name: 'conversationId'
    }, {
      name: 'conversationType'
    }]
  }],
  REMOVE_CONVERSATION_FROM_TAG: [{
    name: 'id',
    type: 'String'
  }, {
    name: 'conversations',
    type: 'Array',
    children: [{
      name: 'conversationId'
    }, {
      name: 'conversationType'
    }]
  }]
};
let COMMAND_TOPICS = {
  HISTORY_MESSAGES: 'qry_hismsgs',
  CONVERSATIONS: 'qry_convers',
  QUERY_TOP_CONVERSATIONS: 'qry_top_convers',
  SYNC_CONVERSATIONS: 'sync_convers',
  SYNC_MESSAGES: 'sync_msgs',
  RECALL: 'recall_msg',
  GET_MENTION_MSGS: 'qry_mention_msgs',
  NTF: 'ntf',
  MSG: 'msg',
  STREAM_MSG: 'stream_msg',
  CHATROOM_USER_NTF: 'c_user_ntf',
  SEND_GROUP: 'g_msg',
  SEND_PRIVATE: 'p_msg',
  SEND_CHATROOM: 'c_msg',
  GET_MERGE_MSGS: 'qry_merged_msgs',
  GET_TOP_MSG: 'get_top_msg',
  SET_TOP_MSG: 'set_top_msg',
  DEL_TOP_MSG: 'del_top_msg',
  MSG_ADD_FAVORITE: 'add_favorite_msgs',
  MSG_REMOVE_FAVORITE: 'del_favorite_msgs',
  MSG_QRY_FAVORITE: 'qry_favorite_msgs',
  GET_FIRST_UNREAD_MSG: 'qry_first_unread_msg',
  CLEAR_UNREAD: 'clear_unread',
  REMOVE_CONVERSATION: 'del_convers',
  INSERT_CONVERSATION: 'add_conver',
  GET_CONVERSATION: 'qry_conver',
  MUTE_CONVERSATION: 'undisturb_convers',
  TOP_CONVERSATION: 'top_convers',
  GET_UNREAD_TOTLAL_CONVERSATION: 'qry_total_unread_count',
  CLEAR_UNREAD_TOTLAL_CONVERSATION: 'clear_total_unread',
  MARK_CONVERSATION_UNREAD: 'mark_unread',
  SET_ALL_DISTURB: 'set_user_undisturb',
  GET_ALL_DISTURB: 'get_user_undisturb',
  READ_MESSAGE: 'mark_read',
  GET_READ_MESSAGE_DETAIL: 'qry_read_detail',
  UPDATE_MESSAGE: 'modify_msg',
  CLEAR_MESSAGE: 'clean_hismsg',
  REMOVE_MESSAGE: 'del_msg',
  GET_MSG_BY_IDS: 'qry_hismsg_by_ids',
  GET_FILE_TOKEN: 'file_cred',
  BATCH_TRANSLATE: 'batch_trans',
  GET_USER_INFO: 'qry_user_info',
  JOIN_CHATROOM: 'c_join',
  QUIT_CHATROOM: 'c_quit',
  SYNC_CHATROOM_MESSAGES: 'c_sync_msgs',
  SYNC_CHATROOM_ATTRS: 'c_sync_atts',
  SET_CHATROOM_ATTRIBUTES: 'c_batch_add_att',
  REMOVE_CHATROOM_ATTRIBUTES: 'c_batch_del_att',
  GET_CHATROOM_ATTRIBUTES: 'fake_c_get_one',
  GET_ALL_CHATROOM_ATTRIBUTES: 'fake_c_get_all',
  ADD_MSG_REACTION: 'msg_exset',
  REMOVE_MSG_REACTION: 'del_msg_exset',
  CONVERSATION_TAG_ADD: 'tag_add_convers',
  CONVERSATION_TAG_REMOVE: 'tag_del_convers',
  TAG_REMOVE: 'del_user_conver_tags',
  CONVERSATION_TAG_QUERY: 'qry_user_conver_tags',
  RTC_CREATE_ROOM: 'rtc_create',
  RTC_JOIN_ROOM: 'rtc_join',
  RTC_QUIT_ROOM: 'rtc_quit',
  RTC_ACCEPT: 'rtc_accept',
  RTC_HANGUP: 'rtc_hangup',
  RTC_QRY_ROOM: 'rtc_qry',
  RTC_PING: 'rtc_ping',
  RTC_INVITE: 'rtc_invite',
  RTC_UPDATE_STATE: 'rtc_upd_state',
  RTC_INVITE_EVENT: 'rtc_invite_event',
  RTC_ROOM_EVENT: 'rtc_room_event'
};
let NOTIFY_TYPE = {
  DEFAULT: 0,
  MSG: 1,
  CHATROOM: 2,
  CHATROOM_ATTR: 3,
  CHATROOM_EVENT: 4,
  CHATROOM_DESTORY: 5
};
let CONNECT_TOOL = {
  START_TIME: 'connect_start_time',
  RECONNECT_FREQUENCY: 'reconnect_frequency',
  RECONNECT_COUNT: 'reconnect_count'
};
let LOG_LEVEL = {
  NONE: 0,
  FATAL: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  DEBUG: 5,
  VERBOSE: 6
};
let LOG_MODULE = {
  INIT: 'J-Init',
  DB_OPEN: 'DB-Open',
  DB_CLOSE: 'DB-Close',
  PB_PARSE: 'PB-Parse',
  PB_MATCH: 'PB-Match',
  WS_RECEIVE: 'WS-Receive',
  WS_SEND: 'WS-Send',
  WS_CONNECT: 'WS-Connect',
  NAV_START: 'Nav-Start',
  NAV_REQEST: 'Nav-Request',
  HB_START: 'HB-Start',
  HB_STOP: 'HB-Stop',
  CON_CONNECT: 'CON-Connect',
  CON_STATUS: 'CON-Status',
  CON_DISCONNECT: 'CON-Disconnect',
  CON_TOKEN: 'CON-Token',
  CON_RECONNECT: 'CON-Reconnect',
  MSG_SYNC: 'MSG-Sync',
  MSG_DELETE: 'MSG-Delete',
  MSG_RECALL: 'MSG-Recall',
  MSG_CLEAR: 'MSG-Clear',
  MSG_GROUP_READ_DETAIL: 'MSG-GroupReadDetail',
  MSG_GET_LIST: 'MSG-Get',
  MSG_GET_MERGE: 'MSG-GetMerge',
  MSG_GET_MENTION: 'MSG-GetMention',
  MSG_REGISTER: 'MSG-Register',
  MSG_SEND: 'MSG-ST',
  MSG_SEND_MASS: 'MSG-ST-MASS',
  MSG_SEND_MERGE: 'MSG-ST-MERGE',
  MSG_SEND_FILE: 'MSG-ST-FILE',
  MSG_RECEIVE: 'MSG-ST-RECEIVE',
  MSG_UPDATE: 'MSG-UPDATE',
  CHATROOM_ATTR_RECEIVE: 'CHATROOM_ATTR_RECEIVE',
  CHATROOM_ATTR_SET: 'CHATROOM_ATTR_SET',
  CHATROOM_ATTR_REMOVE: 'CHATROOM_ATTR_REMOVE',
  CHATROOM_USER_REJOIN: 'CHATROOM_USER_REJOIN',
  CHATROOM_USER_JOIN: 'CHATROOM_USER_JOIN',
  CHATROOM_USER_QUIT: 'CHATROOM_USER_QUIT',
  CHATROOM_SERVER_EVENT: 'CHATROOM_SERVER_EVENT',
  CHATROOM_DESTORYED: 'CHATROOM_DESTORYED',
  CONV_SYNC: 'CONV-Sync',
  CONV_DELETE: 'CONV-Delete',
  CONV_CLEAR_UNREAD: 'CONV-ClearUnread',
  CONV_CLEAR_TOTAL: 'CONV-ClearTotal',
  CONV_MUTE: 'CONV-Mute',
  CONV_TOP: 'CONV-Top'
};
let CHATROOM_ATTR_OP_TYPE = {
  NONE: 0,
  ADD: 1,
  DEL: 2
};
let CHATROOM_EVENT_TYPE = {
  JOIN: 0,
  QUIT: 1,
  KICK: 2,
  FALLOUT: 3
};
let MEDIA_TYPE = {
  AUDIO: 0,
  VIDEO: 1
};

// 以下是对外暴露枚举
let EVENT = {
  STATE_CHANGED: 'state_changed',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_RECALLED: 'message_recalled',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_SET_TOP: 'message_set_top',
  MESSAGE_READ: 'message_read',
  MESSAGE_REMOVED: 'message_removed',
  MESSAGE_CLEAN: 'message_clean',
  MESSAGE_CLEAN_SOMEONE: 'message_clean_someone',
  MESSAGE_REACTION_CHANGED: 'message_reaction_changed',
  TAG_ADDED: 'tag_added',
  TAG_REMOVED: 'tag_removed',
  TAG_CHANGED: 'tag_changed',
  TAG_CONVERSATION_ADDED: 'tag_conversation_added',
  TAG_CONVERSATION_REMOVED: 'tag_conversation_removed',
  CONVERSATION_SYNC_FINISHED: 'conversation_sync_finished',
  CONVERSATION_UNDISTURBED: 'conversation_undisturb',
  CONVERSATION_TOP: 'conversation_top',
  CONVERSATION_CLEARUNREAD: 'conversation_clearunead',
  CLEAR_TOTAL_UNREADCOUNT: 'conversation_total_unreadcount',
  CONVERSATION_CHANGED: 'conversation_changed',
  CONVERSATION_ADDED: 'conversation_added',
  CONVERSATION_REMOVED: 'conversation_removed',
  CHATROOM_ATTRIBUTE_UPDATED: 'chatroom_attr_updated',
  CHATROOM_ATTRIBUTE_DELETED: 'chatroom_attr_deleted',
  CHATROOM_DESTROYED: 'chatroom_destroyed',
  CHATROOM_USER_QUIT: 'chatroom_user_quit',
  CHATROOM_USER_KICKED: 'chatroom_user_kicked',
  RTC_ROOM_EVENT: 'rtc_room_event',
  RTC_INVITE_EVENT: 'rtc_invite_event',
  RTC_FINISHED_1V1_EVENT: 'rtc_finished_1v1_event',
  STREAM_APPENDED: 'stream_appended',
  STREAM_COMPLETED: 'stream_completed'
};
let CONNECT_STATE = {
  CONNECTED: 0,
  CONNECTING: 1,
  DISCONNECTED: 2,
  CONNECT_FAILED: 3,
  DB_OPENED: 4,
  DB_CLOSED: 5,
  RECONNECTING: 6
};
let CONVERATION_TYPE = {
  PRIVATE: 1,
  GROUP: 2,
  CHATROOM: 3,
  SYSTEM: 4
};
let MESSAGE_ORDER = {
  // 获取新的历史消息
  FORWARD: 1,
  // 获取旧的历史消息
  BACKWARD: 0
};
let CONVERSATION_ORDER = {
  FORWARD: 0,
  BACKWARD: 1
};
let MENTION_ORDER = {
  FORWARD: 1,
  BACKWARD: 0
};
let UPLOAD_TYPE = {
  NONE: 0,
  QINIU: 1,
  ALI: 4,
  S3: 2
};
let UNDISTURB_TYPE = {
  DISTURB: 1,
  UNDISTURB: 0
};
let ErrorMessages = [{
  code: 0,
  msg: '链接成功',
  name: 'CONNECT_SUCCESS'
}, {
  code: 11000,
  msg: '默认错误',
  name: 'CONNECT_ERROR'
}, {
  code: 11001,
  msg: '未传 Appkey',
  name: 'CONNECT_APPKEY_IS_REQUIRE'
}, {
  code: 11002,
  msg: '未传 Token',
  name: 'CONNECT_TOKEN_NOT_EXISTS'
}, {
  code: 11003,
  msg: 'Appkey 不存在',
  name: 'CONNECT_APPKEY_NOT_EXISTS'
}, {
  code: 11004,
  msg: 'Token 不合法',
  name: 'CONNECT_TOKEN_ILLEGAL'
}, {
  code: 11005,
  msg: 'Token 未授权',
  name: 'CONNECT_TOKEN_UNAUTHORIZED'
}, {
  code: 11006,
  msg: 'Token 已过期',
  name: 'CONNECT_TOKEN_EXPIRE'
}, {
  code: 11007,
  msg: '需要重定向',
  name: 'CONNECT_REDIRECT'
}, {
  code: 11008,
  msg: '不支持的平台类型',
  name: 'CONNECT_UNSUPPORT_PLATFORM'
}, {
  code: 11009,
  msg: 'App 已封禁',
  name: 'CONNECT_APP_BLOCKED'
}, {
  code: 11010,
  msg: '用户已封禁',
  name: 'CONNECT_USER_BLOCKED'
}, {
  code: 11011,
  msg: '被踢下线',
  name: 'CONNECT_USER_KICKED'
}, {
  code: 11012,
  msg: '注销下线',
  name: 'CONNECT_USER_LOGOUT'
}, {
  code: 11013,
  msg: '不支持的信令',
  name: 'CONNECT_SIGNAL_UNSUPPORT'
}, {
  code: 11014,
  msg: '接口调用超频，默认 100 次/秒',
  name: 'COMMAND_OVER_FREQUENCY'
}, {
  code: 11020,
  msg: '安全域名校验失败',
  name: 'CONNECT_SECURITY_DOMAIN_ERROR'
}, {
  code: 10102,
  msg: '用户不存在',
  name: 'CONNECT_USER_NOT_EXISTS'
}, {
  code: 10104,
  msg: '时区不合法',
  name: 'PARAMS_TIMEZONE_ILLEGAL'
}, {
  code: 12004,
  msg: '消息格式不合法',
  name: 'PARAMS_MESSAGE_ILLEGAL'
}, {
  code: 12005,
  msg: '当前用户被对方拉黑',
  name: 'REJECTED_BY_BLACKLIST'
}, {
  code: 12006,
  msg: '消息扩展，字段重复',
  name: 'KV_DUPLICATION'
}, {
  code: 12007,
  msg: '消息命中敏感词策略，被拦截',
  name: 'MESSAGE_SENSITIVE_WORDS'
}, {
  code: 13002,
  msg: '用户不是群组成员',
  name: 'GROUP_NOT_GROUP_MEMBER'
}, {
  code: 13003,
  msg: '群组被禁言',
  name: 'GROUP_BANNED'
}, {
  code: 13004,
  msg: '群成员被禁言',
  name: 'GROUP_MEMBER_BANNED'
}, {
  code: 13005,
  msg: '群成员数量已达上限',
  name: 'GROUP_MEMBER_OVERFLOW'
}, {
  code: 14004,
  msg: '聊天室属性不存在',
  name: 'CHATROOM_KV_NOT_EXISTS'
}, {
  code: 14006,
  msg: '聊天室已被销毁',
  name: 'CHATROOM_DESTROY'
}, {
  code: 14007,
  msg: '当前用户已被禁言',
  name: 'CHATROOM_MEMBER_BANNED'
}, {
  code: 14008,
  msg: '当前用户已被封禁',
  name: 'CHATROOM_MEMBER_BLOCKED'
}, {
  code: 14001,
  msg: '未加入聊天室',
  name: 'CHATROOM_NOT_JOIN'
}, {
  code: 14002,
  msg: '聊天室属性个数超限制',
  name: 'CHATROOM_ATTR_EXCEED_LIMIT'
}, {
  code: 14003,
  msg: '不可操作其它成员设置的聊天室属性',
  name: 'CHATROOM_ATTR_EXISTS'
}, {
  code: 14005,
  msg: '聊天室不存在',
  name: 'CHATROOM_NOT_EXISTS'
}, {
  code: 11100,
  msg: '入参pb解析失败',
  name: 'PB_ERROR'
}, {
  code: 13001,
  msg: '群组不存在',
  name: 'GROUP_NOT_EXISTS'
}, {
  code: 25000,
  msg: '参数缺失，请检查传入参数',
  name: 'ILLEGAL_PARAMS'
}, {
  code: 25001,
  msg: '连接已存在',
  name: 'CONNECTION_EXISTS'
}, {
  code: 25002,
  msg: '连接不存在',
  name: 'CONNECTION_NOT_READY'
}, {
  code: 25003,
  msg: '参数类型不正确',
  name: 'ILLEGAL_TYPE_PARAMS'
}, {
  code: 25004,
  msg: '连接异常,信令发送超时',
  name: 'COMMAND_FAILED'
}, {
  code: 25005,
  msg: '上传文件组件为空',
  name: 'UPLOAD_PLUGIN_ERROR'
}, {
  code: 25006,
  msg: '上传文件组件与 OSS 存储不一致',
  name: 'UPLOAD_PLUGIN_NOTMATCH'
}, {
  code: 25007,
  msg: '文件上传失败，请重试',
  name: 'UPLOADING_FILE_ERROR'
}, {
  code: 25008,
  msg: '单次合并转发消息条数上限为 20 条',
  name: 'TRANSFER_MESSAGE_COUNT_EXCEED'
}, {
  code: 25009,
  msg: '未建立本地数据库连接，请优先调用连接方法',
  name: 'DATABASE_NOT_OPENED'
}, {
  code: 25010,
  msg: 'Web SDK 方法未实现，请确定使用 PC SDK 调用',
  name: 'SDK_FUNC_NOT_DEFINED'
}, {
  code: 25011,
  msg: '引用消息必须传入完成的 Message 对象',
  name: 'SEND_REFER_MESSAGE_ERROR'
}, {
  code: 25012,
  msg: 'IM 服务连接失败，请检查当前设备网络是否可用',
  name: 'IM_SERVER_CONNECT_ERROR'
}, {
  code: 25013,
  msg: '参数不可为空，请检查传入参数',
  name: 'ILLEGAL_PARAMS_EMPTY'
}, {
  code: 25014,
  msg: 'SDK 内部正在连接，无需重复调用 connect 方法',
  name: 'REPREAT_CONNECTION'
}, {
  code: 25015,
  msg: '消息重复发送，相同的 tid 且正在发送中，无需再次发送消息',
  name: 'MESSAGE_SEND_REPETITION'
}, {
  code: 21200,
  msg: '消息撤回成功',
  name: 'MESSAGE_RECALL_SUCCESS'
}, {
  code: 0,
  msg: '内部业务调用成功',
  name: 'COMMAND_SUCCESS'
}];
function getErrorType() {
  let errors = {};
  utils.forEach(ErrorMessages, error => {
    let {
      name,
      code,
      msg
    } = error;
    errors[name] = {
      code,
      msg
    };
  });
  return errors;
}
let ErrorType = getErrorType();
let MESSAGE_TYPE = {
  TEXT: 'jg:text',
  STREAM_TEXT: 'jgs:text',
  IMAGE: 'jg:img',
  VOICE: 'jg:voice',
  VIDEO: 'jg:video',
  FILE: 'jg:file',
  MERGE: 'jg:merge',
  RECALL: 'jg:recall',
  RECALL_INFO: 'jg:recallinfo',
  READ_MSG: 'jg:readntf',
  READ_GROUP_MSG: 'jg:grpreadntf',
  MODIFY: 'jg:modify',
  CLEAR_MSG: 'jg:cleanmsg',
  CLEAR_UNREAD: 'jg:clearunread',
  CALL_1V1_FINISHED: 'jg:callfinishntf',
  COMMAND_DELETE_MSGS: 'jg:delmsgs',
  COMMAND_UNDISTURB: 'jg:undisturb',
  COMMAND_TOPCONVERS: 'jg:topconvers',
  COMMAND_REMOVE_CONVERS: 'jg:delconvers',
  COMMAND_ADD_CONVER: 'jg:addconver',
  COMMAND_CLEAR_TOTALUNREAD: 'jg:cleartotalunread',
  COMMAND_MARK_UNREAD: 'jg:markunread',
  COMMAND_LOG_REPORT: 'jg:logcmd',
  COMMAND_MSG_EXSET: 'jg:msgexset',
  COMMAND_MSG_SET_TOP: 'jg:topmsg',
  COMMAND_CONVERSATION_TAG_ADD: 'jg:tagaddconvers',
  COMMAND_RTC_1V1_FINISHED: 'jg:callfinishntf',
  // 删除 TAG 下会话
  COMMAND_REMOVE_CONVERS_FROM_TAG: 'jg:tagdelconvers',
  // 删除 TAG 
  COMMAND_CONVERSATION_TAG_REMOVE: 'jg:delconvertags',
  // CLIENT_* 约定为客户端定义适用
  CLIENT_REMOVE_MSGS: 'jgc:removemsgs',
  CLIENT_REMOVE_CONVERS: 'jgc:removeconvers',
  CLIENT_MARK_UNREAD: 'jgc:markunread'
};
let MENTION_TYPE = {
  ALL: 1,
  SOMEONE: 2,
  ALL_SOMEONE: 3
};
let FILE_TYPE = {
  IMAGE: 1,
  AUDIO: 2,
  VIDEO: 3,
  FILE: 4
};
let MESSAGE_SENT_STATE = {
  NONE: 0,
  SENDING: 1,
  SUCCESS: 2,
  FAILED: 3,
  UPLOADING: 4
};
let DISCONNECT_TYPE = {
  DISCONNECT: 1,
  CLOSE: 2,
  ERROR: 3,
  SERVER: 4
};
let UNREAD_TAG = {
  READ: 0,
  UNREAD: 1
};
let SET_SEARCH_CONTENT_TYPE = {
  APPEND: 1,
  REPLACE: 2
};
let CONVERSATION_TAG = {
  jg_all: {
    id: 'jg_all',
    type: 1,
    name: '消息'
  },
  jg_unread: {
    id: 'jg_unread',
    type: 1,
    name: '未读'
  },
  jg_mentionme: {
    id: 'jg_mentionme',
    type: 1,
    name: '@我'
  },
  jg_private: {
    id: 'jg_private',
    type: 1,
    name: '单聊'
  },
  jg_group: {
    id: 'jg_group',
    type: 1,
    name: '群聊'
  }
};
let CONVERATION_TAG_TYPE = {
  USER: 0,
  SYSNTEM: 1,
  GLOBAL: 2
};
let RTC_STATE = {
  NONE: 0,
  INCOMING: 1,
  OUTGOING: 2,
  CONNECTING: 3,
  CONNECTED: 4
};
let RTC_ROOM_TYPE = {
  ONE_ONE: 0,
  ONE_MORE: 1
};
let RTC_INVITE_TYPE = {
  NONE: 0,
  INVITE: 1,
  ACCEPT: 2,
  REJECT: 3,
  CANCEL: 4,
  TIMEOUT: 5
};
let RTC_CHANNEL = {
  ZEGO: 0
};
let STREAM_EVENT = {
  NONE: 0,
  MESSAGE: 1,
  FINISHED: 2
};
let USER_TYPE = {
  USER: 0,
  BOT: 1
};
let CONVERSATION_TOP_TYPE = {
  BY_TOP_TIME: 0,
  BY_MESSAGE_TIME: 1
};

var ENUM = /*#__PURE__*/Object.freeze({
  __proto__: null,
  STORAGE: STORAGE,
  HEART_TIMEOUT: HEART_TIMEOUT,
  SYNC_MESSAGE_TIME: SYNC_MESSAGE_TIME,
  CONNECT_ACK_INDEX: CONNECT_ACK_INDEX,
  PONG_INDEX: PONG_INDEX,
  SIGNAL_NAME: SIGNAL_NAME,
  PLATFORM: PLATFORM,
  MSG_TOP_ACTION_TYPE: MSG_TOP_ACTION_TYPE,
  SIGNAL_CMD: SIGNAL_CMD,
  QOS: QOS,
  FUNC_PARAM_CHECKER: FUNC_PARAM_CHECKER,
  COMMAND_TOPICS: COMMAND_TOPICS,
  NOTIFY_TYPE: NOTIFY_TYPE,
  CONNECT_TOOL: CONNECT_TOOL,
  LOG_LEVEL: LOG_LEVEL,
  LOG_MODULE: LOG_MODULE,
  CHATROOM_ATTR_OP_TYPE: CHATROOM_ATTR_OP_TYPE,
  CHATROOM_EVENT_TYPE: CHATROOM_EVENT_TYPE,
  MEDIA_TYPE: MEDIA_TYPE,
  EVENT: EVENT,
  CONNECT_STATE: CONNECT_STATE,
  CONVERATION_TYPE: CONVERATION_TYPE,
  MESSAGE_ORDER: MESSAGE_ORDER,
  CONVERSATION_ORDER: CONVERSATION_ORDER,
  MENTION_ORDER: MENTION_ORDER,
  UPLOAD_TYPE: UPLOAD_TYPE,
  UNDISTURB_TYPE: UNDISTURB_TYPE,
  ErrorMessages: ErrorMessages,
  ErrorType: ErrorType,
  MESSAGE_TYPE: MESSAGE_TYPE,
  MENTION_TYPE: MENTION_TYPE,
  FILE_TYPE: FILE_TYPE,
  MESSAGE_SENT_STATE: MESSAGE_SENT_STATE,
  DISCONNECT_TYPE: DISCONNECT_TYPE,
  UNREAD_TAG: UNREAD_TAG,
  SET_SEARCH_CONTENT_TYPE: SET_SEARCH_CONTENT_TYPE,
  CONVERSATION_TAG: CONVERSATION_TAG,
  CONVERATION_TAG_TYPE: CONVERATION_TAG_TYPE,
  RTC_STATE: RTC_STATE,
  RTC_ROOM_TYPE: RTC_ROOM_TYPE,
  RTC_INVITE_TYPE: RTC_INVITE_TYPE,
  RTC_CHANNEL: RTC_CHANNEL,
  STREAM_EVENT: STREAM_EVENT,
  USER_TYPE: USER_TYPE,
  CONVERSATION_TOP_TYPE: CONVERSATION_TOP_TYPE
});

function Cache () {
  let caches = {};
  let set = (key, value) => {
    caches[key] = value;
  };
  let get = key => {
    return caches[key] || {};
  };
  let remove = key => {
    delete caches[key];
  };
  let clear = () => {
    caches = {};
  };
  let getAll = () => {
    return caches;
  };
  return {
    set,
    get,
    remove,
    clear,
    getAll
  };
}

function WebStorage () {
  return localStorage;
}

function UniStorage () {
  let removeItem = key => {
    uni.removeStorageSync(key);
  };
  let getItem = key => {
    return uni.getStorageSync(key);
  };
  let setItem = (key, value) => {
    uni.setStorageSync(key, value);
  };
  return {
    removeItem,
    getItem,
    setItem
  };
}

let JStorage = {};
if (typeof uni != "undefined") {
  JStorage = UniStorage();
} else {
  JStorage = WebStorage();
}
var JStorage$1 = JStorage;

let storageCacher = Cache();
// 动态设置 storage key 前缀，例如 _appkey_userid_
let _storage_private_prefix_ = '';
let getKey = key => {
  return `${STORAGE.PREFIX}_${_storage_private_prefix_}_${key}`;
};
let set = (key, value) => {
  let _key = getKey(key);
  let storage = {
    data: value
  };
  storageCacher.set(_key, storage);
  JStorage$1.setItem(_key, utils.toJSON(storage));
};
let get = key => {
  let _key = getKey(key);
  let _storage = storageCacher.get(_key);
  let _value = _storage.data;
  if (!utils.isUndefined(_value)) {
    return _value;
  }
  let storage = JStorage$1.getItem(_key);
  storage = utils.parse(storage) || {
    data: {}
  };
  storageCacher.set(_key, storage);
  let value = storage.data;
  return value;
};
let remove = key => {
  let _key = getKey(key);
  storageCacher.remove(key);
  JStorage$1.removeItem(_key);
};
let setPrefix = str => {
  _storage_private_prefix_ = str;
};
var Storage = {
  get,
  set,
  remove,
  setPrefix
};

/*!
* protobuf.js v7.2.6 (c) 2016, daniel wirtz
* compiled tue, 16 jan 2024 22:54:38 utc
* licensed under the bsd-3-clause license
* see: https://github.com/dcodeio/protobuf.js for details
  https://cdn.jsdelivr.net/npm/protobufjs@7.2.6/dist/protobuf.min.js
  
  更新版本需要修改：
  1、对外暴露方式，i.util.global.protobuf 直接修改为了 JProtobuf
  2、eval 替换成 new Function
*/
let JProtobuf = {};
!function (nt) {

  !function (r, e, t) {
    var i = function t(i) {
      var n = e[i];
      return n || r[i][0].call(n = e[i] = {
        exports: {}
      }, t, n, n.exports), n.exports;
    }(t[0]);
    JProtobuf = i, "function" == typeof define && define.amd && define(["long"], function (t) {
      return t && t.isLong && (i.util.Long = t, i.configure()), i;
    }), "object" == typeof module && module && module.exports && (module.exports = i);
  }({
    1: [function (t, i, n) {
      i.exports = function (t, i) {
        var n = Array(arguments.length - 1),
          s = 0,
          r = 2,
          o = !0;
        for (; r < arguments.length;) n[s++] = arguments[r++];
        return new Promise(function (r, e) {
          n[s] = function (t) {
            if (o) if (o = !1, t) e(t);else {
              for (var i = Array(arguments.length - 1), n = 0; n < i.length;) i[n++] = arguments[n];
              r.apply(null, i);
            }
          };
          try {
            t.apply(i || null, n);
          } catch (t) {
            o && (o = !1, e(t));
          }
        });
      };
    }, {}],
    2: [function (t, i, n) {
      n.length = function (t) {
        var i = t.length;
        if (!i) return 0;
        for (var n = 0; 1 < --i % 4 && "=" == (t[0 | i] || "");) ++n;
        return Math.ceil(3 * t.length) / 4 - n;
      };
      for (var h = Array(64), f = Array(123), r = 0; r < 64;) f[h[r] = r < 26 ? r + 65 : r < 52 ? r + 71 : r < 62 ? r - 4 : r - 59 | 43] = r++;
      n.encode = function (t, i, n) {
        for (var r, e = null, s = [], o = 0, u = 0; i < n;) {
          var f = t[i++];
          switch (u) {
            case 0:
              s[o++] = h[f >> 2], r = (3 & f) << 4, u = 1;
              break;
            case 1:
              s[o++] = h[r | f >> 4], r = (15 & f) << 2, u = 2;
              break;
            case 2:
              s[o++] = h[r | f >> 6], s[o++] = h[63 & f], u = 0;
          }
          8191 < o && ((e = e || []).push(String.fromCharCode.apply(String, s)), o = 0);
        }
        return u && (s[o++] = h[r], s[o++] = 61, 1 === u && (s[o++] = 61)), e ? (o && e.push(String.fromCharCode.apply(String, s.slice(0, o))), e.join("")) : String.fromCharCode.apply(String, s.slice(0, o));
      };
      var a = "invalid encoding";
      n.decode = function (t, i, n) {
        for (var r, e = n, s = 0, o = 0; o < t.length;) {
          var u = t.charCodeAt(o++);
          if (61 == u && 1 < s) break;
          if ((u = f[u]) === nt) throw Error(a);
          switch (s) {
            case 0:
              r = u, s = 1;
              break;
            case 1:
              i[n++] = r << 2 | (48 & u) >> 4, r = u, s = 2;
              break;
            case 2:
              i[n++] = (15 & r) << 4 | (60 & u) >> 2, r = u, s = 3;
              break;
            case 3:
              i[n++] = (3 & r) << 6 | u, s = 0;
          }
        }
        if (1 === s) throw Error(a);
        return n - e;
      }, n.test = function (t) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(t);
      };
    }, {}],
    3: [function (t, i, n) {
      function c(i, n) {
        "string" == typeof i && (n = i, i = nt);
        var f = [];
        function h(t) {
          if ("string" != typeof t) {
            var i = a();
            if (c.verbose && console.log("codegen: " + i), i = "return " + i, t) {
              for (var n = Object.keys(t), r = Array(n.length + 1), e = Array(n.length), s = 0; s < n.length;) r[s] = n[s], e[s] = t[n[s++]];
              return r[s] = i, Function.apply(null, r).apply(null, e);
            }
            return Function(i)();
          }
          for (var o = Array(arguments.length - 1), u = 0; u < o.length;) o[u] = arguments[++u];
          if (u = 0, t = t.replace(/%([%dfijs])/g, function (t, i) {
            var n = o[u++];
            switch (i) {
              case "d":
              case "f":
                return "" + +("" + n);
              case "i":
                return "" + Math.floor(n);
              case "j":
                return JSON.stringify(n);
              case "s":
                return "" + n;
            }
            return "%";
          }), u !== o.length) throw Error("parameter count mismatch");
          return f.push(t), h;
        }
        function a(t) {
          return "function " + (t || n || "") + "(" + (i && i.join(",") || "") + "){\n  " + f.join("\n  ") + "\n}";
        }
        return h.toString = a, h;
      }
      (i.exports = c).verbose = !1;
    }, {}],
    4: [function (t, i, n) {
      function r() {
        this.i = {};
      }
      (i.exports = r).prototype.on = function (t, i, n) {
        return (this.i[t] || (this.i[t] = [])).push({
          fn: i,
          ctx: n || this
        }), this;
      }, r.prototype.off = function (t, i) {
        if (t === nt) this.i = {};else if (i === nt) this.i[t] = [];else for (var n = this.i[t], r = 0; r < n.length;) n[r].fn === i ? n.splice(r, 1) : ++r;
        return this;
      }, r.prototype.emit = function (t) {
        var i = this.i[t];
        if (i) {
          for (var n = [], r = 1; r < arguments.length;) n.push(arguments[r++]);
          for (r = 0; r < i.length;) i[r].fn.apply(i[r++].ctx, n);
        }
        return this;
      };
    }, {}],
    5: [function (t, i, n) {
      i.exports = u;
      var s = t(1),
        o = t(7)("fs");
      function u(n, r, e) {
        return r = "function" == typeof r ? (e = r, {}) : r || {}, e ? !r.xhr && o && o.readFile ? o.readFile(n, function (t, i) {
          return t && "undefined" != typeof XMLHttpRequest ? u.xhr(n, r, e) : t ? e(t) : e(null, r.binary ? i : i.toString("utf8"));
        }) : u.xhr(n, r, e) : s(u, this, n, r);
      }
      u.xhr = function (t, n, r) {
        var e = new XMLHttpRequest();
        e.onreadystatechange = function () {
          if (4 !== e.readyState) return nt;
          if (0 !== e.status && 200 !== e.status) return r(Error("status " + e.status));
          if (n.binary) {
            if (!(t = e.response)) for (var t = [], i = 0; i < e.responseText.length; ++i) t.push(255 & e.responseText.charCodeAt(i));
            return r(null, "undefined" != typeof Uint8Array ? new Uint8Array(t) : t);
          }
          return r(null, e.responseText);
        }, n.binary && ("overrideMimeType" in e && e.overrideMimeType("text/plain; charset=x-user-defined"), e.responseType = "arraybuffer"), e.open("GET", t), e.send();
      };
    }, {
      1: 1,
      7: 7
    }],
    6: [function (t, i, n) {
      function r(t) {
        function i(t, i, n, r) {
          var e = i < 0 ? 1 : 0;
          t(0 === (i = e ? -i : i) ? 0 < 1 / i ? 0 : 2147483648 : isNaN(i) ? 2143289344 : 34028234663852886e22 < i ? (e << 31 | 2139095040) >>> 0 : i < 11754943508222875e-54 ? (e << 31 | Math.round(i / 1401298464324817e-60)) >>> 0 : (e << 31 | 127 + (t = Math.floor(Math.log(i) / Math.LN2)) << 23 | 8388607 & Math.round(i * Math.pow(2, -t) * 8388608)) >>> 0, n, r);
        }
        function n(t, i, n) {
          t = t(i, n), i = 2 * (t >> 31) + 1, n = t >>> 23 & 255, t &= 8388607;
          return 255 == n ? t ? NaN : 1 / 0 * i : 0 == n ? 1401298464324817e-60 * i * t : i * Math.pow(2, n - 150) * (8388608 + t);
        }
        function r(t, i, n) {
          u[0] = t, i[n] = f[0], i[n + 1] = f[1], i[n + 2] = f[2], i[n + 3] = f[3];
        }
        function e(t, i, n) {
          u[0] = t, i[n] = f[3], i[n + 1] = f[2], i[n + 2] = f[1], i[n + 3] = f[0];
        }
        function s(t, i) {
          return f[0] = t[i], f[1] = t[i + 1], f[2] = t[i + 2], f[3] = t[i + 3], u[0];
        }
        function o(t, i) {
          return f[3] = t[i], f[2] = t[i + 1], f[1] = t[i + 2], f[0] = t[i + 3], u[0];
        }
        var u, f, h, a, c;
        function l(t, i, n, r, e, s) {
          var o,
            u = r < 0 ? 1 : 0;
          0 === (r = u ? -r : r) ? (t(0, e, s + i), t(0 < 1 / r ? 0 : 2147483648, e, s + n)) : isNaN(r) ? (t(0, e, s + i), t(2146959360, e, s + n)) : 17976931348623157e292 < r ? (t(0, e, s + i), t((u << 31 | 2146435072) >>> 0, e, s + n)) : r < 22250738585072014e-324 ? (t((o = r / 5e-324) >>> 0, e, s + i), t((u << 31 | o / 4294967296) >>> 0, e, s + n)) : (t(4503599627370496 * (o = r * Math.pow(2, -(r = 1024 === (r = Math.floor(Math.log(r) / Math.LN2)) ? 1023 : r))) >>> 0, e, s + i), t((u << 31 | r + 1023 << 20 | 1048576 * o & 1048575) >>> 0, e, s + n));
        }
        function d(t, i, n, r, e) {
          i = t(r, e + i), t = t(r, e + n), r = 2 * (t >> 31) + 1, e = t >>> 20 & 2047, n = 4294967296 * (1048575 & t) + i;
          return 2047 == e ? n ? NaN : 1 / 0 * r : 0 == e ? 5e-324 * r * n : r * Math.pow(2, e - 1075) * (n + 4503599627370496);
        }
        function p(t, i, n) {
          h[0] = t, i[n] = a[0], i[n + 1] = a[1], i[n + 2] = a[2], i[n + 3] = a[3], i[n + 4] = a[4], i[n + 5] = a[5], i[n + 6] = a[6], i[n + 7] = a[7];
        }
        function v(t, i, n) {
          h[0] = t, i[n] = a[7], i[n + 1] = a[6], i[n + 2] = a[5], i[n + 3] = a[4], i[n + 4] = a[3], i[n + 5] = a[2], i[n + 6] = a[1], i[n + 7] = a[0];
        }
        function b(t, i) {
          return a[0] = t[i], a[1] = t[i + 1], a[2] = t[i + 2], a[3] = t[i + 3], a[4] = t[i + 4], a[5] = t[i + 5], a[6] = t[i + 6], a[7] = t[i + 7], h[0];
        }
        function y(t, i) {
          return a[7] = t[i], a[6] = t[i + 1], a[5] = t[i + 2], a[4] = t[i + 3], a[3] = t[i + 4], a[2] = t[i + 5], a[1] = t[i + 6], a[0] = t[i + 7], h[0];
        }
        return "undefined" != typeof Float32Array ? (u = new Float32Array([-0]), f = new Uint8Array(u.buffer), c = 128 === f[3], t.writeFloatLE = c ? r : e, t.writeFloatBE = c ? e : r, t.readFloatLE = c ? s : o, t.readFloatBE = c ? o : s) : (t.writeFloatLE = i.bind(null, w), t.writeFloatBE = i.bind(null, m), t.readFloatLE = n.bind(null, g), t.readFloatBE = n.bind(null, j)), "undefined" != typeof Float64Array ? (h = new Float64Array([-0]), a = new Uint8Array(h.buffer), c = 128 === a[7], t.writeDoubleLE = c ? p : v, t.writeDoubleBE = c ? v : p, t.readDoubleLE = c ? b : y, t.readDoubleBE = c ? y : b) : (t.writeDoubleLE = l.bind(null, w, 0, 4), t.writeDoubleBE = l.bind(null, m, 4, 0), t.readDoubleLE = d.bind(null, g, 0, 4), t.readDoubleBE = d.bind(null, j, 4, 0)), t;
      }
      function w(t, i, n) {
        i[n] = 255 & t, i[n + 1] = t >>> 8 & 255, i[n + 2] = t >>> 16 & 255, i[n + 3] = t >>> 24;
      }
      function m(t, i, n) {
        i[n] = t >>> 24, i[n + 1] = t >>> 16 & 255, i[n + 2] = t >>> 8 & 255, i[n + 3] = 255 & t;
      }
      function g(t, i) {
        return (t[i] | t[i + 1] << 8 | t[i + 2] << 16 | t[i + 3] << 24) >>> 0;
      }
      function j(t, i) {
        return (t[i] << 24 | t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3]) >>> 0;
      }
      i.exports = r(r);
    }, {}],
    7: [function (t, i, n) {
      function r(t) {
        try {
          var i = new Function("require")(t);
          if (i && (i.length || Object.keys(i).length)) return i;
        } catch (t) {}
        return null;
      }
      i.exports = r;
    }, {}],
    8: [function (t, i, n) {
      var e = n.isAbsolute = function (t) {
          return /^(?:\/|\w+:)/.test(t);
        },
        r = n.normalize = function (t) {
          var i = (t = t.replace(/\\/g, "/").replace(/\/{2,}/g, "/")).split("/"),
            n = e(t),
            t = "";
          n && (t = i.shift() + "/");
          for (var r = 0; r < i.length;) ".." === i[r] ? 0 < r && ".." !== i[r - 1] ? i.splice(--r, 2) : n ? i.splice(r, 1) : ++r : "." === i[r] ? i.splice(r, 1) : ++r;
          return t + i.join("/");
        };
      n.resolve = function (t, i, n) {
        return n || (i = r(i)), !e(i) && (t = (t = n ? t : r(t)).replace(/(?:\/|^)[^/]+$/, "")).length ? r(t + "/" + i) : i;
      };
    }, {}],
    9: [function (t, i, n) {
      i.exports = function (i, n, t) {
        var r = t || 8192,
          e = r >>> 1,
          s = null,
          o = r;
        return function (t) {
          if (t < 1 || e < t) return i(t);
          r < o + t && (s = i(r), o = 0);
          t = n.call(s, o, o += t);
          return 7 & o && (o = 1 + (7 | o)), t;
        };
      };
    }, {}],
    10: [function (t, i, n) {
      n.length = function (t) {
        for (var i, n = 0, r = 0; r < t.length; ++r) (i = t.charCodeAt(r)) < 128 ? n += 1 : i < 2048 ? n += 2 : 55296 == (64512 & i) && 56320 == (64512 & t.charCodeAt(r + 1)) ? (++r, n += 4) : n += 3;
        return n;
      }, n.read = function (t, i, n) {
        if (n - i < 1) return "";
        for (var r, e = null, s = [], o = 0; i < n;) (r = t[i++]) < 128 ? s[o++] = r : 191 < r && r < 224 ? s[o++] = (31 & r) << 6 | 63 & t[i++] : 239 < r && r < 365 ? (r = ((7 & r) << 18 | (63 & t[i++]) << 12 | (63 & t[i++]) << 6 | 63 & t[i++]) - 65536, s[o++] = 55296 + (r >> 10), s[o++] = 56320 + (1023 & r)) : s[o++] = (15 & r) << 12 | (63 & t[i++]) << 6 | 63 & t[i++], 8191 < o && ((e = e || []).push(String.fromCharCode.apply(String, s)), o = 0);
        return e ? (o && e.push(String.fromCharCode.apply(String, s.slice(0, o))), e.join("")) : String.fromCharCode.apply(String, s.slice(0, o));
      }, n.write = function (t, i, n) {
        for (var r, e, s = n, o = 0; o < t.length; ++o) (r = t.charCodeAt(o)) < 128 ? i[n++] = r : (r < 2048 ? i[n++] = r >> 6 | 192 : (55296 == (64512 & r) && 56320 == (64512 & (e = t.charCodeAt(o + 1))) ? (++o, i[n++] = (r = 65536 + ((1023 & r) << 10) + (1023 & e)) >> 18 | 240, i[n++] = r >> 12 & 63 | 128) : i[n++] = r >> 12 | 224, i[n++] = r >> 6 & 63 | 128), i[n++] = 63 & r | 128);
        return n - s;
      };
    }, {}],
    11: [function (t, i, n) {
      i.exports = e;
      var r = /\/|\./;
      function e(t, i) {
        r.test(t) || (t = "google/protobuf/" + t + ".proto", i = {
          nested: {
            google: {
              nested: {
                protobuf: {
                  nested: i
                }
              }
            }
          }
        }), e[t] = i;
      }
      e("any", {
        Any: {
          fields: {
            type_url: {
              type: "string",
              id: 1
            },
            value: {
              type: "bytes",
              id: 2
            }
          }
        }
      }), e("duration", {
        Duration: i = {
          fields: {
            seconds: {
              type: "int64",
              id: 1
            },
            nanos: {
              type: "int32",
              id: 2
            }
          }
        }
      }), e("timestamp", {
        Timestamp: i
      }), e("empty", {
        Empty: {
          fields: {}
        }
      }), e("struct", {
        Struct: {
          fields: {
            fields: {
              keyType: "string",
              type: "Value",
              id: 1
            }
          }
        },
        Value: {
          oneofs: {
            kind: {
              oneof: ["nullValue", "numberValue", "stringValue", "boolValue", "structValue", "listValue"]
            }
          },
          fields: {
            nullValue: {
              type: "NullValue",
              id: 1
            },
            numberValue: {
              type: "double",
              id: 2
            },
            stringValue: {
              type: "string",
              id: 3
            },
            boolValue: {
              type: "bool",
              id: 4
            },
            structValue: {
              type: "Struct",
              id: 5
            },
            listValue: {
              type: "ListValue",
              id: 6
            }
          }
        },
        NullValue: {
          values: {
            NULL_VALUE: 0
          }
        },
        ListValue: {
          fields: {
            values: {
              rule: "repeated",
              type: "Value",
              id: 1
            }
          }
        }
      }), e("wrappers", {
        DoubleValue: {
          fields: {
            value: {
              type: "double",
              id: 1
            }
          }
        },
        FloatValue: {
          fields: {
            value: {
              type: "float",
              id: 1
            }
          }
        },
        Int64Value: {
          fields: {
            value: {
              type: "int64",
              id: 1
            }
          }
        },
        UInt64Value: {
          fields: {
            value: {
              type: "uint64",
              id: 1
            }
          }
        },
        Int32Value: {
          fields: {
            value: {
              type: "int32",
              id: 1
            }
          }
        },
        UInt32Value: {
          fields: {
            value: {
              type: "uint32",
              id: 1
            }
          }
        },
        BoolValue: {
          fields: {
            value: {
              type: "bool",
              id: 1
            }
          }
        },
        StringValue: {
          fields: {
            value: {
              type: "string",
              id: 1
            }
          }
        },
        BytesValue: {
          fields: {
            value: {
              type: "bytes",
              id: 1
            }
          }
        }
      }), e("field_mask", {
        FieldMask: {
          fields: {
            paths: {
              rule: "repeated",
              type: "string",
              id: 1
            }
          }
        }
      }), e.get = function (t) {
        return e[t] || null;
      };
    }, {}],
    12: [function (t, i, n) {
      var l = t(15),
        d = t(37);
      function o(t, i, n, r) {
        var e = !1;
        if (i.resolvedType) {
          if (i.resolvedType instanceof l) {
            t("switch(d%s){", r);
            for (var s = i.resolvedType.values, o = Object.keys(s), u = 0; u < o.length; ++u) s[o[u]] !== i.typeDefault || e || (t("default:")('if(typeof(d%s)==="number"){m%s=d%s;break}', r, r, r), i.repeated || t("break"), e = !0), t("case%j:", o[u])("case %i:", s[o[u]])("m%s=%j", r, s[o[u]])("break");
            t("}");
          } else t('if(typeof d%s!=="object")', r)("throw TypeError(%j)", i.fullName + ": object expected")("m%s=types[%i].fromObject(d%s)", r, n, r);
        } else {
          var f = !1;
          switch (i.type) {
            case "double":
            case "float":
              t("m%s=Number(d%s)", r, r);
              break;
            case "uint32":
            case "fixed32":
              t("m%s=d%s>>>0", r, r);
              break;
            case "int32":
            case "sint32":
            case "sfixed32":
              t("m%s=d%s|0", r, r);
              break;
            case "uint64":
              f = !0;
            case "int64":
            case "sint64":
            case "fixed64":
            case "sfixed64":
              t("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j", r, r, f)('else if(typeof d%s==="string")', r)("m%s=parseInt(d%s,10)", r, r)('else if(typeof d%s==="number")', r)("m%s=d%s", r, r)('else if(typeof d%s==="object")', r)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)", r, r, r, f ? "true" : "");
              break;
            case "bytes":
              t('if(typeof d%s==="string")', r)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)", r, r, r)("else if(d%s.length >= 0)", r)("m%s=d%s", r, r);
              break;
            case "string":
              t("m%s=String(d%s)", r, r);
              break;
            case "bool":
              t("m%s=Boolean(d%s)", r, r);
          }
        }
        return t;
      }
      function p(t, i, n, r) {
        if (i.resolvedType) i.resolvedType instanceof l ? t("d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s", r, n, r, r, n, r, r) : t("d%s=types[%i].toObject(m%s,o)", r, n, r);else {
          var e = !1;
          switch (i.type) {
            case "double":
            case "float":
              t("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", r, r, r, r);
              break;
            case "uint64":
              e = !0;
            case "int64":
            case "sint64":
            case "fixed64":
            case "sfixed64":
              t('if(typeof m%s==="number")', r)("d%s=o.longs===String?String(m%s):m%s", r, r, r)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s", r, r, r, r, e ? "true" : "", r);
              break;
            case "bytes":
              t("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s", r, r, r, r, r);
              break;
            default:
              t("d%s=m%s", r, r);
          }
        }
        return t;
      }
      n.fromObject = function (t) {
        var i = t.fieldsArray,
          n = d.codegen(["d"], t.name + "$fromObject")("if(d instanceof this.ctor)")("return d");
        if (!i.length) return n("return new this.ctor");
        n("var m=new this.ctor");
        for (var r = 0; r < i.length; ++r) {
          var e = i[r].resolve(),
            s = d.safeProp(e.name);
          e.map ? (n("if(d%s){", s)('if(typeof d%s!=="object")', s)("throw TypeError(%j)", e.fullName + ": object expected")("m%s={}", s)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", s), o(n, e, r, s + "[ks[i]]")("}")("}")) : e.repeated ? (n("if(d%s){", s)("if(!Array.isArray(d%s))", s)("throw TypeError(%j)", e.fullName + ": array expected")("m%s=[]", s)("for(var i=0;i<d%s.length;++i){", s), o(n, e, r, s + "[i]")("}")("}")) : (e.resolvedType instanceof l || n("if(d%s!=null){", s), o(n, e, r, s), e.resolvedType instanceof l || n("}"));
        }
        return n("return m");
      }, n.toObject = function (t) {
        var i = t.fieldsArray.slice().sort(d.compareFieldsById);
        if (!i.length) return d.codegen()("return {}");
        for (var n = d.codegen(["m", "o"], t.name + "$toObject")("if(!o)")("o={}")("var d={}"), r = [], e = [], s = [], o = 0; o < i.length; ++o) i[o].partOf || (i[o].resolve().repeated ? r : i[o].map ? e : s).push(i[o]);
        if (r.length) {
          for (n("if(o.arrays||o.defaults){"), o = 0; o < r.length; ++o) n("d%s=[]", d.safeProp(r[o].name));
          n("}");
        }
        if (e.length) {
          for (n("if(o.objects||o.defaults){"), o = 0; o < e.length; ++o) n("d%s={}", d.safeProp(e[o].name));
          n("}");
        }
        if (s.length) {
          for (n("if(o.defaults){"), o = 0; o < s.length; ++o) {
            var u,
              f = s[o],
              h = d.safeProp(f.name);
            f.resolvedType instanceof l ? n("d%s=o.enums===String?%j:%j", h, f.resolvedType.valuesById[f.typeDefault], f.typeDefault) : f.long ? n("if(util.Long){")("var n=new util.Long(%i,%i,%j)", f.typeDefault.low, f.typeDefault.high, f.typeDefault.unsigned)("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n", h)("}else")("d%s=o.longs===String?%j:%i", h, f.typeDefault.toString(), f.typeDefault.toNumber()) : f.bytes ? (u = "[" + Array.prototype.slice.call(f.typeDefault).join(",") + "]", n("if(o.bytes===String)d%s=%j", h, String.fromCharCode.apply(String, f.typeDefault))("else{")("d%s=%s", h, u)("if(o.bytes!==Array)d%s=util.newBuffer(d%s)", h, h)("}")) : n("d%s=%j", h, f.typeDefault);
          }
          n("}");
        }
        for (var a = !1, o = 0; o < i.length; ++o) {
          var f = i[o],
            c = t.e.indexOf(f),
            h = d.safeProp(f.name);
          f.map ? (a || (a = !0, n("var ks2")), n("if(m%s&&(ks2=Object.keys(m%s)).length){", h, h)("d%s={}", h)("for(var j=0;j<ks2.length;++j){"), p(n, f, c, h + "[ks2[j]]")("}")) : f.repeated ? (n("if(m%s&&m%s.length){", h, h)("d%s=[]", h)("for(var j=0;j<m%s.length;++j){", h), p(n, f, c, h + "[j]")("}")) : (n("if(m%s!=null&&m.hasOwnProperty(%j)){", h, f.name), p(n, f, c, h), f.partOf && n("if(o.oneofs)")("d%s=%j", d.safeProp(f.partOf.name), f.name)), n("}");
        }
        return n("return d");
      };
    }, {
      15: 15,
      37: 37
    }],
    13: [function (t, i, n) {
      i.exports = function (t) {
        var i = h.codegen(["r", "l"], t.name + "$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("var c=l===undefined?r.len:r.pos+l,m=new this.ctor" + (t.fieldsArray.filter(function (t) {
          return t.map;
        }).length ? ",k,value" : ""))("while(r.pos<c){")("var t=r.uint32()");
        t.group && i("if((t&7)===4)")("break");
        i("switch(t>>>3){");
        for (var n = 0; n < t.fieldsArray.length; ++n) {
          var r = t.e[n].resolve(),
            e = r.resolvedType instanceof u ? "int32" : r.type,
            s = "m" + h.safeProp(r.name);
          i("case %i: {", r.id), r.map ? (i("if(%s===util.emptyObject)", s)("%s={}", s)("var c2 = r.uint32()+r.pos"), f.defaults[r.keyType] !== nt ? i("k=%j", f.defaults[r.keyType]) : i("k=null"), f.defaults[e] !== nt ? i("value=%j", f.defaults[e]) : i("value=null"), i("while(r.pos<c2){")("var tag2=r.uint32()")("switch(tag2>>>3){")("case 1: k=r.%s(); break", r.keyType)("case 2:"), f.basic[e] === nt ? i("value=types[%i].decode(r,r.uint32())", n) : i("value=r.%s()", e), i("break")("default:")("r.skipType(tag2&7)")("break")("}")("}"), f.long[r.keyType] !== nt ? i('%s[typeof k==="object"?util.longToHash(k):k]=value', s) : i("%s[k]=value", s)) : r.repeated ? (i("if(!(%s&&%s.length))", s, s)("%s=[]", s), f.packed[e] !== nt && i("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())", s, e)("}else"), f.basic[e] === nt ? i(r.resolvedType.group ? "%s.push(types[%i].decode(r))" : "%s.push(types[%i].decode(r,r.uint32()))", s, n) : i("%s.push(r.%s())", s, e)) : f.basic[e] === nt ? i(r.resolvedType.group ? "%s=types[%i].decode(r)" : "%s=types[%i].decode(r,r.uint32())", s, n) : i("%s=r.%s()", s, e), i("break")("}");
        }
        for (i("default:")("r.skipType(t&7)")("break")("}")("}"), n = 0; n < t.e.length; ++n) {
          var o = t.e[n];
          o.required && i("if(!m.hasOwnProperty(%j))", o.name)("throw util.ProtocolError(%j,{instance:m})", "missing required '" + o.name + "'");
        }
        return i("return m");
      };
      var u = t(15),
        f = t(36),
        h = t(37);
    }, {
      15: 15,
      36: 36,
      37: 37
    }],
    14: [function (t, i, n) {
      i.exports = function (t) {
        for (var i, n = c.codegen(["m", "w"], t.name + "$encode")("if(!w)")("w=Writer.create()"), r = t.fieldsArray.slice().sort(c.compareFieldsById), e = 0; e < r.length; ++e) {
          var s = r[e].resolve(),
            o = t.e.indexOf(s),
            u = s.resolvedType instanceof h ? "int32" : s.type,
            f = a.basic[u];
          i = "m" + c.safeProp(s.name), s.map ? (n("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){", i, s.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){", i)("w.uint32(%i).fork().uint32(%i).%s(ks[i])", (s.id << 3 | 2) >>> 0, 8 | a.mapKey[s.keyType], s.keyType), f === nt ? n("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()", o, i) : n(".uint32(%i).%s(%s[ks[i]]).ldelim()", 16 | f, u, i), n("}")("}")) : s.repeated ? (n("if(%s!=null&&%s.length){", i, i), s.packed && a.packed[u] !== nt ? n("w.uint32(%i).fork()", (s.id << 3 | 2) >>> 0)("for(var i=0;i<%s.length;++i)", i)("w.%s(%s[i])", u, i)("w.ldelim()") : (n("for(var i=0;i<%s.length;++i)", i), f === nt ? l(n, s, o, i + "[i]") : n("w.uint32(%i).%s(%s[i])", (s.id << 3 | f) >>> 0, u, i)), n("}")) : (s.optional && n("if(%s!=null&&Object.hasOwnProperty.call(m,%j))", i, s.name), f === nt ? l(n, s, o, i) : n("w.uint32(%i).%s(%s)", (s.id << 3 | f) >>> 0, u, i));
        }
        return n("return w");
      };
      var h = t(15),
        a = t(36),
        c = t(37);
      function l(t, i, n, r) {
        i.resolvedType.group ? t("types[%i].encode(%s,w.uint32(%i)).uint32(%i)", n, r, (i.id << 3 | 3) >>> 0, (i.id << 3 | 4) >>> 0) : t("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()", n, r, (i.id << 3 | 2) >>> 0);
      }
    }, {
      15: 15,
      36: 36,
      37: 37
    }],
    15: [function (t, i, n) {
      i.exports = s;
      var f = t(24),
        r = (((s.prototype = Object.create(f.prototype)).constructor = s).className = "Enum", t(23)),
        e = t(37);
      function s(t, i, n, r, e, s) {
        if (f.call(this, t, n), i && "object" != typeof i) throw TypeError("values must be an object");
        if (this.valuesById = {}, this.values = Object.create(this.valuesById), this.comment = r, this.comments = e || {}, this.valuesOptions = s, this.reserved = nt, i) for (var o = Object.keys(i), u = 0; u < o.length; ++u) "number" == typeof i[o[u]] && (this.valuesById[this.values[o[u]] = i[o[u]]] = o[u]);
      }
      s.fromJSON = function (t, i) {
        t = new s(t, i.values, i.options, i.comment, i.comments);
        return t.reserved = i.reserved, t;
      }, s.prototype.toJSON = function (t) {
        t = !!t && !!t.keepComments;
        return e.toObject(["options", this.options, "valuesOptions", this.valuesOptions, "values", this.values, "reserved", this.reserved && this.reserved.length ? this.reserved : nt, "comment", t ? this.comment : nt, "comments", t ? this.comments : nt]);
      }, s.prototype.add = function (t, i, n, r) {
        if (!e.isString(t)) throw TypeError("name must be a string");
        if (!e.isInteger(i)) throw TypeError("id must be an integer");
        if (this.values[t] !== nt) throw Error("duplicate name '" + t + "' in " + this);
        if (this.isReservedId(i)) throw Error("id " + i + " is reserved in " + this);
        if (this.isReservedName(t)) throw Error("name '" + t + "' is reserved in " + this);
        if (this.valuesById[i] !== nt) {
          if (!this.options || !this.options.allow_alias) throw Error("duplicate id " + i + " in " + this);
          this.values[t] = i;
        } else this.valuesById[this.values[t] = i] = t;
        return r && (this.valuesOptions === nt && (this.valuesOptions = {}), this.valuesOptions[t] = r || null), this.comments[t] = n || null, this;
      }, s.prototype.remove = function (t) {
        if (!e.isString(t)) throw TypeError("name must be a string");
        var i = this.values[t];
        if (null == i) throw Error("name '" + t + "' does not exist in " + this);
        return delete this.valuesById[i], delete this.values[t], delete this.comments[t], this.valuesOptions && delete this.valuesOptions[t], this;
      }, s.prototype.isReservedId = function (t) {
        return r.isReservedId(this.reserved, t);
      }, s.prototype.isReservedName = function (t) {
        return r.isReservedName(this.reserved, t);
      };
    }, {
      23: 23,
      24: 24,
      37: 37
    }],
    16: [function (t, i, n) {
      i.exports = o;
      var r,
        u = t(24),
        e = (((o.prototype = Object.create(u.prototype)).constructor = o).className = "Field", t(15)),
        f = t(36),
        h = t(37),
        a = /^required|optional|repeated$/;
      function o(t, i, n, r, e, s, o) {
        if (h.isObject(r) ? (o = e, s = r, r = e = nt) : h.isObject(e) && (o = s, s = e, e = nt), u.call(this, t, s), !h.isInteger(i) || i < 0) throw TypeError("id must be a non-negative integer");
        if (!h.isString(n)) throw TypeError("type must be a string");
        if (r !== nt && !a.test(r = r.toString().toLowerCase())) throw TypeError("rule must be a string rule");
        if (e !== nt && !h.isString(e)) throw TypeError("extend must be a string");
        this.rule = (r = "proto3_optional" === r ? "optional" : r) && "optional" !== r ? r : nt, this.type = n, this.id = i, this.extend = e || nt, this.required = "required" === r, this.optional = !this.required, this.repeated = "repeated" === r, this.map = !1, this.message = null, this.partOf = null, this.typeDefault = null, this.defaultValue = null, this.long = !!h.Long && f.long[n] !== nt, this.bytes = "bytes" === n, this.resolvedType = null, this.extensionField = null, this.declaringField = null, this.o = null, this.comment = o;
      }
      o.fromJSON = function (t, i) {
        return new o(t, i.id, i.type, i.rule, i.extend, i.options, i.comment);
      }, Object.defineProperty(o.prototype, "packed", {
        get: function () {
          return null === this.o && (this.o = !1 !== this.getOption("packed")), this.o;
        }
      }), o.prototype.setOption = function (t, i, n) {
        return "packed" === t && (this.o = null), u.prototype.setOption.call(this, t, i, n);
      }, o.prototype.toJSON = function (t) {
        t = !!t && !!t.keepComments;
        return h.toObject(["rule", "optional" !== this.rule && this.rule || nt, "type", this.type, "id", this.id, "extend", this.extend, "options", this.options, "comment", t ? this.comment : nt]);
      }, o.prototype.resolve = function () {
        var t;
        return this.resolved ? this : ((this.typeDefault = f.defaults[this.type]) === nt ? (this.resolvedType = (this.declaringField || this).parent.lookupTypeOrEnum(this.type), this.resolvedType instanceof r ? this.typeDefault = null : this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]]) : this.options && this.options.proto3_optional && (this.typeDefault = null), this.options && null != this.options.default && (this.typeDefault = this.options.default, this.resolvedType instanceof e && "string" == typeof this.typeDefault && (this.typeDefault = this.resolvedType.values[this.typeDefault])), this.options && (!0 !== this.options.packed && (this.options.packed === nt || !this.resolvedType || this.resolvedType instanceof e) || delete this.options.packed, Object.keys(this.options).length || (this.options = nt)), this.long ? (this.typeDefault = h.Long.fromNumber(this.typeDefault, "u" == (this.type[0] || "")), Object.freeze && Object.freeze(this.typeDefault)) : this.bytes && "string" == typeof this.typeDefault && (h.base64.test(this.typeDefault) ? h.base64.decode(this.typeDefault, t = h.newBuffer(h.base64.length(this.typeDefault)), 0) : h.utf8.write(this.typeDefault, t = h.newBuffer(h.utf8.length(this.typeDefault)), 0), this.typeDefault = t), this.map ? this.defaultValue = h.emptyObject : this.repeated ? this.defaultValue = h.emptyArray : this.defaultValue = this.typeDefault, this.parent instanceof r && (this.parent.ctor.prototype[this.name] = this.defaultValue), u.prototype.resolve.call(this));
      }, o.d = function (n, r, e, s) {
        return "function" == typeof r ? r = h.decorateType(r).name : r && "object" == typeof r && (r = h.decorateEnum(r).name), function (t, i) {
          h.decorateType(t.constructor).add(new o(i, n, r, e, {
            default: s
          }));
        };
      }, o.u = function (t) {
        r = t;
      };
    }, {
      15: 15,
      24: 24,
      36: 36,
      37: 37
    }],
    17: [function (t, i, n) {
      var r = i.exports = t(18);
      r.build = "light", r.load = function (t, i, n) {
        return (i = "function" == typeof i ? (n = i, new r.Root()) : i || new r.Root()).load(t, n);
      }, r.loadSync = function (t, i) {
        return (i = i || new r.Root()).loadSync(t);
      }, r.encoder = t(14), r.decoder = t(13), r.verifier = t(40), r.converter = t(12), r.ReflectionObject = t(24), r.Namespace = t(23), r.Root = t(29), r.Enum = t(15), r.Type = t(35), r.Field = t(16), r.OneOf = t(25), r.MapField = t(20), r.Service = t(33), r.Method = t(22), r.Message = t(21), r.wrappers = t(41), r.types = t(36), r.util = t(37), r.ReflectionObject.u(r.Root), r.Namespace.u(r.Type, r.Service, r.Enum), r.Root.u(r.Type), r.Field.u(r.Type);
    }, {
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      18: 18,
      20: 20,
      21: 21,
      22: 22,
      23: 23,
      24: 24,
      25: 25,
      29: 29,
      33: 33,
      35: 35,
      36: 36,
      37: 37,
      40: 40,
      41: 41
    }],
    18: [function (t, i, n) {
      var r = n;
      function e() {
        r.util.u(), r.Writer.u(r.BufferWriter), r.Reader.u(r.BufferReader);
      }
      r.build = "minimal", r.Writer = t(42), r.BufferWriter = t(43), r.Reader = t(27), r.BufferReader = t(28), r.util = t(39), r.rpc = t(31), r.roots = t(30), r.configure = e, e();
    }, {
      27: 27,
      28: 28,
      30: 30,
      31: 31,
      39: 39,
      42: 42,
      43: 43
    }],
    19: [function (t, i, n) {
      i = i.exports = t(17);
      i.build = "full", i.tokenize = t(34), i.parse = t(26), i.common = t(11), i.Root.u(i.Type, i.parse, i.common);
    }, {
      11: 11,
      17: 17,
      26: 26,
      34: 34
    }],
    20: [function (t, i, n) {
      i.exports = s;
      var o = t(16),
        r = (((s.prototype = Object.create(o.prototype)).constructor = s).className = "MapField", t(36)),
        u = t(37);
      function s(t, i, n, r, e, s) {
        if (o.call(this, t, i, r, nt, nt, e, s), !u.isString(n)) throw TypeError("keyType must be a string");
        this.keyType = n, this.resolvedKeyType = null, this.map = !0;
      }
      s.fromJSON = function (t, i) {
        return new s(t, i.id, i.keyType, i.type, i.options, i.comment);
      }, s.prototype.toJSON = function (t) {
        t = !!t && !!t.keepComments;
        return u.toObject(["keyType", this.keyType, "type", this.type, "id", this.id, "extend", this.extend, "options", this.options, "comment", t ? this.comment : nt]);
      }, s.prototype.resolve = function () {
        if (this.resolved) return this;
        if (r.mapKey[this.keyType] === nt) throw Error("invalid key type: " + this.keyType);
        return o.prototype.resolve.call(this);
      }, s.d = function (n, r, e) {
        return "function" == typeof e ? e = u.decorateType(e).name : e && "object" == typeof e && (e = u.decorateEnum(e).name), function (t, i) {
          u.decorateType(t.constructor).add(new s(i, n, r, e));
        };
      };
    }, {
      16: 16,
      36: 36,
      37: 37
    }],
    21: [function (t, i, n) {
      i.exports = e;
      var r = t(39);
      function e(t) {
        if (t) for (var i = Object.keys(t), n = 0; n < i.length; ++n) this[i[n]] = t[i[n]];
      }
      e.create = function (t) {
        return this.$type.create(t);
      }, e.encode = function (t, i) {
        return this.$type.encode(t, i);
      }, e.encodeDelimited = function (t, i) {
        return this.$type.encodeDelimited(t, i);
      }, e.decode = function (t) {
        return this.$type.decode(t);
      }, e.decodeDelimited = function (t) {
        return this.$type.decodeDelimited(t);
      }, e.verify = function (t) {
        return this.$type.verify(t);
      }, e.fromObject = function (t) {
        return this.$type.fromObject(t);
      }, e.toObject = function (t, i) {
        return this.$type.toObject(t, i);
      }, e.prototype.toJSON = function () {
        return this.$type.toObject(this, r.toJSONOptions);
      };
    }, {
      39: 39
    }],
    22: [function (t, i, n) {
      i.exports = r;
      var h = t(24),
        a = (((r.prototype = Object.create(h.prototype)).constructor = r).className = "Method", t(37));
      function r(t, i, n, r, e, s, o, u, f) {
        if (a.isObject(e) ? (o = e, e = s = nt) : a.isObject(s) && (o = s, s = nt), i !== nt && !a.isString(i)) throw TypeError("type must be a string");
        if (!a.isString(n)) throw TypeError("requestType must be a string");
        if (!a.isString(r)) throw TypeError("responseType must be a string");
        h.call(this, t, o), this.type = i || "rpc", this.requestType = n, this.requestStream = !!e || nt, this.responseType = r, this.responseStream = !!s || nt, this.resolvedRequestType = null, this.resolvedResponseType = null, this.comment = u, this.parsedOptions = f;
      }
      r.fromJSON = function (t, i) {
        return new r(t, i.type, i.requestType, i.responseType, i.requestStream, i.responseStream, i.options, i.comment, i.parsedOptions);
      }, r.prototype.toJSON = function (t) {
        t = !!t && !!t.keepComments;
        return a.toObject(["type", "rpc" !== this.type && this.type || nt, "requestType", this.requestType, "requestStream", this.requestStream, "responseType", this.responseType, "responseStream", this.responseStream, "options", this.options, "comment", t ? this.comment : nt, "parsedOptions", this.parsedOptions]);
      }, r.prototype.resolve = function () {
        return this.resolved ? this : (this.resolvedRequestType = this.parent.lookupType(this.requestType), this.resolvedResponseType = this.parent.lookupType(this.responseType), h.prototype.resolve.call(this));
      };
    }, {
      24: 24,
      37: 37
    }],
    23: [function (t, i, n) {
      i.exports = c;
      var e,
        s,
        o,
        r = t(24),
        u = (((c.prototype = Object.create(r.prototype)).constructor = c).className = "Namespace", t(16)),
        f = t(37),
        h = t(25);
      function a(t, i) {
        if (!t || !t.length) return nt;
        for (var n = {}, r = 0; r < t.length; ++r) n[t[r].name] = t[r].toJSON(i);
        return n;
      }
      function c(t, i) {
        r.call(this, t, i), this.nested = nt, this.f = null;
      }
      function l(t) {
        return t.f = null, t;
      }
      c.fromJSON = function (t, i) {
        return new c(t, i.options).addJSON(i.nested);
      }, c.arrayToJSON = a, c.isReservedId = function (t, i) {
        if (t) for (var n = 0; n < t.length; ++n) if ("string" != typeof t[n] && t[n][0] <= i && t[n][1] > i) return !0;
        return !1;
      }, c.isReservedName = function (t, i) {
        if (t) for (var n = 0; n < t.length; ++n) if (t[n] === i) return !0;
        return !1;
      }, Object.defineProperty(c.prototype, "nestedArray", {
        get: function () {
          return this.f || (this.f = f.toArray(this.nested));
        }
      }), c.prototype.toJSON = function (t) {
        return f.toObject(["options", this.options, "nested", a(this.nestedArray, t)]);
      }, c.prototype.addJSON = function (t) {
        if (t) for (var i, n = Object.keys(t), r = 0; r < n.length; ++r) i = t[n[r]], this.add((i.fields !== nt ? e : i.values !== nt ? o : i.methods !== nt ? s : i.id !== nt ? u : c).fromJSON(n[r], i));
        return this;
      }, c.prototype.get = function (t) {
        return this.nested && this.nested[t] || null;
      }, c.prototype.getEnum = function (t) {
        if (this.nested && this.nested[t] instanceof o) return this.nested[t].values;
        throw Error("no such enum: " + t);
      }, c.prototype.add = function (t) {
        if (!(t instanceof u && t.extend !== nt || t instanceof e || t instanceof h || t instanceof o || t instanceof s || t instanceof c)) throw TypeError("object must be a valid nested object");
        if (this.nested) {
          var i = this.get(t.name);
          if (i) {
            if (!(i instanceof c && t instanceof c) || i instanceof e || i instanceof s) throw Error("duplicate name '" + t.name + "' in " + this);
            for (var n = i.nestedArray, r = 0; r < n.length; ++r) t.add(n[r]);
            this.remove(i), this.nested || (this.nested = {}), t.setOptions(i.options, !0);
          }
        } else this.nested = {};
        return (this.nested[t.name] = t).onAdd(this), l(this);
      }, c.prototype.remove = function (t) {
        if (!(t instanceof r)) throw TypeError("object must be a ReflectionObject");
        if (t.parent !== this) throw Error(t + " is not a member of " + this);
        return delete this.nested[t.name], Object.keys(this.nested).length || (this.nested = nt), t.onRemove(this), l(this);
      }, c.prototype.define = function (t, i) {
        if (f.isString(t)) t = t.split(".");else if (!Array.isArray(t)) throw TypeError("illegal path");
        if (t && t.length && "" === t[0]) throw Error("path must be relative");
        for (var n = this; 0 < t.length;) {
          var r = t.shift();
          if (n.nested && n.nested[r]) {
            if (!((n = n.nested[r]) instanceof c)) throw Error("path conflicts with non-namespace objects");
          } else n.add(n = new c(r));
        }
        return i && n.addJSON(i), n;
      }, c.prototype.resolveAll = function () {
        for (var t = this.nestedArray, i = 0; i < t.length;) t[i] instanceof c ? t[i++].resolveAll() : t[i++].resolve();
        return this.resolve();
      }, c.prototype.lookup = function (t, i, n) {
        if ("boolean" == typeof i ? (n = i, i = nt) : i && !Array.isArray(i) && (i = [i]), f.isString(t) && t.length) {
          if ("." === t) return this.root;
          t = t.split(".");
        } else if (!t.length) return this;
        if ("" === t[0]) return this.root.lookup(t.slice(1), i);
        var r = this.get(t[0]);
        if (r) {
          if (1 === t.length) {
            if (!i || ~i.indexOf(r.constructor)) return r;
          } else if (r instanceof c && (r = r.lookup(t.slice(1), i, !0))) return r;
        } else for (var e = 0; e < this.nestedArray.length; ++e) if (this.f[e] instanceof c && (r = this.f[e].lookup(t, i, !0))) return r;
        return null === this.parent || n ? null : this.parent.lookup(t, i);
      }, c.prototype.lookupType = function (t) {
        var i = this.lookup(t, [e]);
        if (i) return i;
        throw Error("no such type: " + t);
      }, c.prototype.lookupEnum = function (t) {
        var i = this.lookup(t, [o]);
        if (i) return i;
        throw Error("no such Enum '" + t + "' in " + this);
      }, c.prototype.lookupTypeOrEnum = function (t) {
        var i = this.lookup(t, [e, o]);
        if (i) return i;
        throw Error("no such Type or Enum '" + t + "' in " + this);
      }, c.prototype.lookupService = function (t) {
        var i = this.lookup(t, [s]);
        if (i) return i;
        throw Error("no such Service '" + t + "' in " + this);
      }, c.u = function (t, i, n) {
        e = t, s = i, o = n;
      };
    }, {
      16: 16,
      24: 24,
      25: 25,
      37: 37
    }],
    24: [function (t, i, n) {
      (i.exports = e).className = "ReflectionObject";
      var r,
        o = t(37);
      function e(t, i) {
        if (!o.isString(t)) throw TypeError("name must be a string");
        if (i && !o.isObject(i)) throw TypeError("options must be an object");
        this.options = i, this.parsedOptions = null, this.name = t, this.parent = null, this.resolved = !1, this.comment = null, this.filename = null;
      }
      Object.defineProperties(e.prototype, {
        root: {
          get: function () {
            for (var t = this; null !== t.parent;) t = t.parent;
            return t;
          }
        },
        fullName: {
          get: function () {
            for (var t = [this.name], i = this.parent; i;) t.unshift(i.name), i = i.parent;
            return t.join(".");
          }
        }
      }), e.prototype.toJSON = function () {
        throw Error();
      }, e.prototype.onAdd = function (t) {
        this.parent && this.parent !== t && this.parent.remove(this), this.parent = t, this.resolved = !1;
        t = t.root;
        t instanceof r && t.h(this);
      }, e.prototype.onRemove = function (t) {
        t = t.root;
        t instanceof r && t.a(this), this.parent = null, this.resolved = !1;
      }, e.prototype.resolve = function () {
        return this.resolved || this.root instanceof r && (this.resolved = !0), this;
      }, e.prototype.getOption = function (t) {
        return this.options ? this.options[t] : nt;
      }, e.prototype.setOption = function (t, i, n) {
        return n && this.options && this.options[t] !== nt || ((this.options || (this.options = {}))[t] = i), this;
      }, e.prototype.setParsedOption = function (i, t, n) {
        this.parsedOptions || (this.parsedOptions = []);
        var r,
          e,
          s = this.parsedOptions;
        return n ? (r = s.find(function (t) {
          return Object.prototype.hasOwnProperty.call(t, i);
        })) ? (e = r[i], o.setProperty(e, n, t)) : ((r = {})[i] = o.setProperty({}, n, t), s.push(r)) : ((e = {})[i] = t, s.push(e)), this;
      }, e.prototype.setOptions = function (t, i) {
        if (t) for (var n = Object.keys(t), r = 0; r < n.length; ++r) this.setOption(n[r], t[n[r]], i);
        return this;
      }, e.prototype.toString = function () {
        var t = this.constructor.className,
          i = this.fullName;
        return i.length ? t + " " + i : t;
      }, e.u = function (t) {
        r = t;
      };
    }, {
      37: 37
    }],
    25: [function (t, i, n) {
      i.exports = o;
      var e = t(24),
        r = (((o.prototype = Object.create(e.prototype)).constructor = o).className = "OneOf", t(16)),
        s = t(37);
      function o(t, i, n, r) {
        if (Array.isArray(i) || (n = i, i = nt), e.call(this, t, n), i !== nt && !Array.isArray(i)) throw TypeError("fieldNames must be an Array");
        this.oneof = i || [], this.fieldsArray = [], this.comment = r;
      }
      function u(t) {
        if (t.parent) for (var i = 0; i < t.fieldsArray.length; ++i) t.fieldsArray[i].parent || t.parent.add(t.fieldsArray[i]);
      }
      o.fromJSON = function (t, i) {
        return new o(t, i.oneof, i.options, i.comment);
      }, o.prototype.toJSON = function (t) {
        t = !!t && !!t.keepComments;
        return s.toObject(["options", this.options, "oneof", this.oneof, "comment", t ? this.comment : nt]);
      }, o.prototype.add = function (t) {
        if (t instanceof r) return t.parent && t.parent !== this.parent && t.parent.remove(t), this.oneof.push(t.name), this.fieldsArray.push(t), u(t.partOf = this), this;
        throw TypeError("field must be a Field");
      }, o.prototype.remove = function (t) {
        if (!(t instanceof r)) throw TypeError("field must be a Field");
        var i = this.fieldsArray.indexOf(t);
        if (i < 0) throw Error(t + " is not a member of " + this);
        return this.fieldsArray.splice(i, 1), -1 < (i = this.oneof.indexOf(t.name)) && this.oneof.splice(i, 1), t.partOf = null, this;
      }, o.prototype.onAdd = function (t) {
        e.prototype.onAdd.call(this, t);
        for (var i = 0; i < this.oneof.length; ++i) {
          var n = t.get(this.oneof[i]);
          n && !n.partOf && (n.partOf = this).fieldsArray.push(n);
        }
        u(this);
      }, o.prototype.onRemove = function (t) {
        for (var i, n = 0; n < this.fieldsArray.length; ++n) (i = this.fieldsArray[n]).parent && i.parent.remove(i);
        e.prototype.onRemove.call(this, t);
      }, o.d = function () {
        for (var n = Array(arguments.length), t = 0; t < arguments.length;) n[t] = arguments[t++];
        return function (t, i) {
          s.decorateType(t.constructor).add(new o(i, n)), Object.defineProperty(t, i, {
            get: s.oneOfGetter(n),
            set: s.oneOfSetter(n)
          });
        };
      };
    }, {
      16: 16,
      24: 24,
      37: 37
    }],
    26: [function (t, i, n) {
      (i.exports = it).filename = null, it.defaults = {
        keepCase: !1
      };
      var I = t(34),
        F = t(29),
        L = t(35),
        U = t(16),
        q = t(20),
        R = t(25),
        z = t(15),
        Z = t(33),
        B = t(22),
        P = t(36),
        H = t(37),
        X = /^[1-9][0-9]*$/,
        C = /^-?[1-9][0-9]*$/,
        D = /^0[x][0-9a-fA-F]+$/,
        J = /^-?0[x][0-9a-fA-F]+$/,
        W = /^0[0-7]+$/,
        G = /^-?0[0-7]+$/,
        K = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/,
        Q = /^[a-zA-Z_][a-zA-Z_0-9]*$/,
        Y = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/,
        tt = /^(?:\.[a-zA-Z_][a-zA-Z_0-9]*)+$/;
      function it(t, i, n) {
        i instanceof F || (n = i, i = new F());
        var r,
          e,
          s,
          o,
          h,
          u,
          f,
          a = (n = n || it.defaults).preferTrailingComment || !1,
          c = I(t, n.alternateCommentMode || !1),
          l = c.next,
          d = c.push,
          p = c.peek,
          v = c.skip,
          b = c.cmnt,
          y = !0,
          w = !1,
          m = i,
          g = n.keepCase ? function (t) {
            return t;
          } : H.camelCase;
        function j(t, i, n) {
          var r = it.filename;
          return n || (it.filename = null), Error("illegal " + (i || "token") + " '" + t + "' (" + (r ? r + ", " : "") + "line " + c.line + ")");
        }
        function k() {
          var t,
            i = [];
          do {
            if ('"' !== (t = l()) && "'" !== t) throw j(t);
          } while ((i.push(l()), v(t), '"' === (t = p()) || "'" === t));
          return i.join("");
        }
        function O(i) {
          var n = l();
          switch (n) {
            case "'":
            case '"':
              return d(n), k();
            case "true":
            case "TRUE":
              return !0;
            case "false":
            case "FALSE":
              return !1;
          }
          try {
            var t = n,
              r = !0,
              e = 1;
            switch ("-" == (t[0] || "") && (e = -1, t = t.substring(1)), t) {
              case "inf":
              case "INF":
              case "Inf":
                return e * (1 / 0);
              case "nan":
              case "NAN":
              case "Nan":
              case "NaN":
                return NaN;
              case "0":
                return 0;
            }
            if (X.test(t)) return e * parseInt(t, 10);
            if (D.test(t)) return e * parseInt(t, 16);
            if (W.test(t)) return e * parseInt(t, 8);
            if (K.test(t)) return e * parseFloat(t);
            throw j(t, "number", r);
          } catch (t) {
            if (i && Y.test(n)) return n;
            throw j(n, "value");
          }
        }
        function E(t, i) {
          for (var n; !i || '"' !== (n = p()) && "'" !== n ? t.push([n = A(l()), v("to", !0) ? A(l()) : n]) : t.push(k()), v(",", !0););
          v(";");
        }
        function A(t, i) {
          switch (t) {
            case "max":
            case "MAX":
            case "Max":
              return 536870911;
            case "0":
              return 0;
          }
          if (i || "-" != (t[0] || "")) {
            if (C.test(t)) return parseInt(t, 10);
            if (J.test(t)) return parseInt(t, 16);
            if (G.test(t)) return parseInt(t, 8);
          }
          throw j(t, "id");
        }
        function x(t, i) {
          switch (i) {
            case "option":
              return $(t, i), v(";"), 1;
            case "message":
              return T(t), 1;
            case "enum":
              return V(t), 1;
            case "service":
              var h,
                n = t,
                r = i;
              if (Q.test(r = l())) return S(h = new Z(r), function (t) {
                if (!x(h, t)) {
                  if ("rpc" !== t) throw j(t);
                  var i = h,
                    n = b(),
                    r = t;
                  if (!Q.test(t = l())) throw j(t, "name");
                  var e,
                    s,
                    o,
                    u = t;
                  if (v("("), v("stream", !0) && (s = !0), !Y.test(t = l())) throw j(t);
                  if (e = t, v(")"), v("returns"), v("("), v("stream", !0) && (o = !0), !Y.test(t = l())) throw j(t);
                  t = t, v(")");
                  var f = new B(u, r, e, t, s, o);
                  f.comment = n, S(f, function (t) {
                    if ("option" !== t) throw j(t);
                    $(f, t), v(";");
                  }), i.add(f);
                }
              }), n.add(h), 1;
              throw j(r, "service name");
            case "extend":
              var e,
                s = t,
                n = i;
              if (Y.test(n = l())) return e = n, S(null, function (t) {
                switch (t) {
                  case "required":
                  case "repeated":
                    N(s, t, e);
                    break;
                  case "optional":
                    N(s, w ? "proto3_optional" : "optional", e);
                    break;
                  default:
                    if (!w || !Y.test(t)) throw j(t);
                    d(t), N(s, "optional", e);
                }
              }), 1;
              throw j(n, "reference");
          }
        }
        function S(t, i, n) {
          var r,
            e = c.line;
          if (t && ("string" != typeof t.comment && (t.comment = b()), t.filename = it.filename), v("{", !0)) {
            for (; "}" !== (r = l());) i(r);
            v(";", !0);
          } else n && n(), v(";"), t && ("string" != typeof t.comment || a) && (t.comment = b(e) || t.comment);
        }
        function T(t, i) {
          if (!Q.test(i = l())) throw j(i, "type name");
          var u = new L(i);
          S(u, function (t) {
            if (!x(u, t)) switch (t) {
              case "map":
                var i = u,
                  n = (v("<"), l());
                if (P.mapKey[n] === nt) throw j(n, "type");
                v(",");
                var r = l();
                if (!Y.test(r)) throw j(r, "type");
                v(">");
                var e = l();
                if (!Q.test(e)) throw j(e, "name");
                v("=");
                var s = new q(g(e), A(l()), n, r);
                S(s, function (t) {
                  if ("option" !== t) throw j(t);
                  $(s, t), v(";");
                }, function () {
                  M(s);
                }), i.add(s);
                break;
              case "required":
              case "repeated":
                N(u, t);
                break;
              case "optional":
                N(u, w ? "proto3_optional" : "optional");
                break;
              case "oneof":
                e = u, n = t;
                if (!Q.test(n = l())) throw j(n, "name");
                var o = new R(g(n));
                S(o, function (t) {
                  "option" === t ? ($(o, t), v(";")) : (d(t), N(o, "optional"));
                }), e.add(o);
                break;
              case "extensions":
                E(u.extensions || (u.extensions = []));
                break;
              case "reserved":
                E(u.reserved || (u.reserved = []), !0);
                break;
              default:
                if (!w || !Y.test(t)) throw j(t);
                d(t), N(u, "optional");
            }
          }), t.add(u);
        }
        function N(t, i, n) {
          var r = l();
          if ("group" === r) {
            var e,
              s,
              o = t,
              u = i,
              f = l();
            if (Q.test(f)) return s = H.lcFirst(f), f === s && (f = H.ucFirst(f)), v("="), h = A(l()), (e = new L(f)).group = !0, (s = new U(s, h, f, u)).filename = it.filename, S(e, function (t) {
              switch (t) {
                case "option":
                  $(e, t), v(";");
                  break;
                case "required":
                case "repeated":
                  N(e, t);
                  break;
                case "optional":
                  N(e, w ? "proto3_optional" : "optional");
                  break;
                case "message":
                  T(e);
                  break;
                case "enum":
                  V(e);
                  break;
                default:
                  throw j(t);
              }
            }), void o.add(e).add(s);
            throw j(f, "name");
          }
          for (; r.endsWith(".") || p().startsWith(".");) r += l();
          if (!Y.test(r)) throw j(r, "type");
          var h = l();
          if (!Q.test(h)) throw j(h, "name");
          h = g(h), v("=");
          var a = new U(h, A(l()), r, i, n);
          S(a, function (t) {
            if ("option" !== t) throw j(t);
            $(a, t), v(";");
          }, function () {
            M(a);
          }), "proto3_optional" === i ? (u = new R("_" + h), a.setOption("proto3_optional", !0), u.add(a), t.add(u)) : t.add(a), w || !a.repeated || P.packed[r] === nt && P.basic[r] !== nt || a.setOption("packed", !1, !0);
        }
        function V(t, i) {
          if (!Q.test(i = l())) throw j(i, "name");
          var s = new z(i);
          S(s, function (t) {
            switch (t) {
              case "option":
                $(s, t), v(";");
                break;
              case "reserved":
                E(s.reserved || (s.reserved = []), !0);
                break;
              default:
                var i = s,
                  n = t;
                if (!Q.test(n)) throw j(n, "name");
                v("=");
                var r = A(l(), !0),
                  e = {
                    options: nt,
                    setOption: function (t, i) {
                      this.options === nt && (this.options = {}), this.options[t] = i;
                    }
                  };
                return S(e, function (t) {
                  if ("option" !== t) throw j(t);
                  $(e, t), v(";");
                }, function () {
                  M(e);
                }), void i.add(n, r, e.comment, e.options);
            }
          }), t.add(s);
        }
        function $(t, i) {
          var n = v("(", !0);
          if (!Y.test(i = l())) throw j(i, "name");
          var r,
            e = i,
            s = e,
            n = (n && (v(")"), s = e = "(" + e + ")", i = p(), tt.test(i) && (r = i.slice(1), e += i, l())), v("="), function t(i, n) {
              if (v("{", !0)) {
                for (var r = {}; !v("}", !0);) {
                  if (!Q.test(h = l())) throw j(h, "name");
                  if (null === h) throw j(h, "end of input");
                  var e,
                    s,
                    o = h;
                  if (v(":", !0), "{" === p()) e = t(i, n + "." + h);else if ("[" === p()) {
                    if (e = [], v("[", !0)) {
                      for (; s = O(!0), e.push(s), v(",", !0););
                      v("]"), void 0 !== s && _(i, n + "." + h, s);
                    }
                  } else e = O(!0), _(i, n + "." + h, e);
                  var u = r[o];
                  u && (e = [].concat(u).concat(e)), r[o] = e, v(",", !0), v(";", !0);
                }
                return r;
              }
              var f = O(!0);
              _(i, n, f);
              return f;
            }(t, e));
          i = s, e = n, s = r, (n = t).setParsedOption && n.setParsedOption(i, e, s);
        }
        function _(t, i, n) {
          t.setOption && t.setOption(i, n);
        }
        function M(t) {
          if (v("[", !0)) {
            for (; $(t, "option"), v(",", !0););
            v("]");
          }
        }
        for (; null !== (h = l());) switch (h) {
          case "package":
            if (!y) throw j(h);
            if (r !== nt) throw j("package");
            if (r = l(), !Y.test(r)) throw j(r, "name");
            m = m.define(r), v(";");
            break;
          case "import":
            if (!y) throw j(h);
            switch (f = u = void 0, p()) {
              case "weak":
                f = s = s || [], l();
                break;
              case "public":
                l();
              default:
                f = e = e || [];
            }
            u = k(), v(";"), f.push(u);
            break;
          case "syntax":
            if (!y) throw j(h);
            if (v("="), o = k(), !(w = "proto3" === o) && "proto2" !== o) throw j(o, "syntax");
            v(";");
            break;
          case "option":
            $(m, h), v(";");
            break;
          default:
            if (x(m, h)) {
              y = !1;
              continue;
            }
            throw j(h);
        }
        return it.filename = null, {
          package: r,
          imports: e,
          weakImports: s,
          syntax: o,
          root: i
        };
      }
    }, {
      15: 15,
      16: 16,
      20: 20,
      22: 22,
      25: 25,
      29: 29,
      33: 33,
      34: 34,
      35: 35,
      36: 36,
      37: 37
    }],
    27: [function (t, i, n) {
      i.exports = f;
      var r,
        e = t(39),
        s = e.LongBits,
        o = e.utf8;
      function u(t, i) {
        return RangeError("index out of range: " + t.pos + " + " + (i || 1) + " > " + t.len);
      }
      function f(t) {
        this.buf = t, this.pos = 0, this.len = t.length;
      }
      function h() {
        return e.Buffer ? function (t) {
          return (f.create = function (t) {
            return e.Buffer.isBuffer(t) ? new r(t) : c(t);
          })(t);
        } : c;
      }
      var a,
        c = "undefined" != typeof Uint8Array ? function (t) {
          if (t instanceof Uint8Array || Array.isArray(t)) return new f(t);
          throw Error("illegal buffer");
        } : function (t) {
          if (Array.isArray(t)) return new f(t);
          throw Error("illegal buffer");
        };
      function l() {
        var t = new s(0, 0),
          i = 0;
        if (!(4 < this.len - this.pos)) {
          for (; i < 3; ++i) {
            if (this.pos >= this.len) throw u(this);
            if (t.lo = (t.lo | (127 & this.buf[this.pos]) << 7 * i) >>> 0, this.buf[this.pos++] < 128) return t;
          }
          return t.lo = (t.lo | (127 & this.buf[this.pos++]) << 7 * i) >>> 0, t;
        }
        for (; i < 4; ++i) if (t.lo = (t.lo | (127 & this.buf[this.pos]) << 7 * i) >>> 0, this.buf[this.pos++] < 128) return t;
        if (t.lo = (t.lo | (127 & this.buf[this.pos]) << 28) >>> 0, t.hi = (t.hi | (127 & this.buf[this.pos]) >> 4) >>> 0, this.buf[this.pos++] < 128) return t;
        if (i = 0, 4 < this.len - this.pos) {
          for (; i < 5; ++i) if (t.hi = (t.hi | (127 & this.buf[this.pos]) << 7 * i + 3) >>> 0, this.buf[this.pos++] < 128) return t;
        } else for (; i < 5; ++i) {
          if (this.pos >= this.len) throw u(this);
          if (t.hi = (t.hi | (127 & this.buf[this.pos]) << 7 * i + 3) >>> 0, this.buf[this.pos++] < 128) return t;
        }
        throw Error("invalid varint encoding");
      }
      function d(t, i) {
        return (t[i - 4] | t[i - 3] << 8 | t[i - 2] << 16 | t[i - 1] << 24) >>> 0;
      }
      function p() {
        if (this.pos + 8 > this.len) throw u(this, 8);
        return new s(d(this.buf, this.pos += 4), d(this.buf, this.pos += 4));
      }
      f.create = h(), f.prototype.c = e.Array.prototype.subarray || e.Array.prototype.slice, f.prototype.uint32 = (a = 4294967295, function () {
        if (a = (127 & this.buf[this.pos]) >>> 0, this.buf[this.pos++] < 128 || (a = (a | (127 & this.buf[this.pos]) << 7) >>> 0, this.buf[this.pos++] < 128 || (a = (a | (127 & this.buf[this.pos]) << 14) >>> 0, this.buf[this.pos++] < 128 || (a = (a | (127 & this.buf[this.pos]) << 21) >>> 0, this.buf[this.pos++] < 128 || (a = (a | (15 & this.buf[this.pos]) << 28) >>> 0, this.buf[this.pos++] < 128 || !((this.pos += 5) > this.len)))))) return a;
        throw this.pos = this.len, u(this, 10);
      }), f.prototype.int32 = function () {
        return 0 | this.uint32();
      }, f.prototype.sint32 = function () {
        var t = this.uint32();
        return t >>> 1 ^ -(1 & t) | 0;
      }, f.prototype.bool = function () {
        return 0 !== this.uint32();
      }, f.prototype.fixed32 = function () {
        if (this.pos + 4 > this.len) throw u(this, 4);
        return d(this.buf, this.pos += 4);
      }, f.prototype.sfixed32 = function () {
        if (this.pos + 4 > this.len) throw u(this, 4);
        return 0 | d(this.buf, this.pos += 4);
      }, f.prototype.float = function () {
        if (this.pos + 4 > this.len) throw u(this, 4);
        var t = e.float.readFloatLE(this.buf, this.pos);
        return this.pos += 4, t;
      }, f.prototype.double = function () {
        if (this.pos + 8 > this.len) throw u(this, 4);
        var t = e.float.readDoubleLE(this.buf, this.pos);
        return this.pos += 8, t;
      }, f.prototype.bytes = function () {
        var t = this.uint32(),
          i = this.pos,
          n = this.pos + t;
        if (n > this.len) throw u(this, t);
        return this.pos += t, Array.isArray(this.buf) ? this.buf.slice(i, n) : i === n ? (t = e.Buffer) ? t.alloc(0) : new this.buf.constructor(0) : this.c.call(this.buf, i, n);
      }, f.prototype.string = function () {
        var t = this.bytes();
        return o.read(t, 0, t.length);
      }, f.prototype.skip = function (t) {
        if ("number" == typeof t) {
          if (this.pos + t > this.len) throw u(this, t);
          this.pos += t;
        } else do {
          if (this.pos >= this.len) throw u(this);
        } while (128 & this.buf[this.pos++]);
        return this;
      }, f.prototype.skipType = function (t) {
        switch (t) {
          case 0:
            this.skip();
            break;
          case 1:
            this.skip(8);
            break;
          case 2:
            this.skip(this.uint32());
            break;
          case 3:
            for (; 4 != (t = 7 & this.uint32());) this.skipType(t);
            break;
          case 5:
            this.skip(4);
            break;
          default:
            throw Error("invalid wire type " + t + " at offset " + this.pos);
        }
        return this;
      }, f.u = function (t) {
        r = t, f.create = h(), r.u();
        var i = e.Long ? "toLong" : "toNumber";
        e.merge(f.prototype, {
          int64: function () {
            return l.call(this)[i](!1);
          },
          uint64: function () {
            return l.call(this)[i](!0);
          },
          sint64: function () {
            return l.call(this).zzDecode()[i](!1);
          },
          fixed64: function () {
            return p.call(this)[i](!0);
          },
          sfixed64: function () {
            return p.call(this)[i](!1);
          }
        });
      };
    }, {
      39: 39
    }],
    28: [function (t, i, n) {
      i.exports = s;
      var r = t(27),
        e = ((s.prototype = Object.create(r.prototype)).constructor = s, t(39));
      function s(t) {
        r.call(this, t);
      }
      s.u = function () {
        e.Buffer && (s.prototype.c = e.Buffer.prototype.slice);
      }, s.prototype.string = function () {
        var t = this.uint32();
        return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + t, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + t, this.len));
      }, s.u();
    }, {
      27: 27,
      39: 39
    }],
    29: [function (t, i, n) {
      i.exports = f;
      var r,
        d,
        p,
        e = t(23),
        s = (((f.prototype = Object.create(e.prototype)).constructor = f).className = "Root", t(16)),
        o = t(15),
        u = t(25),
        v = t(37);
      function f(t) {
        e.call(this, "", t), this.deferred = [], this.files = [];
      }
      function b() {}
      f.fromJSON = function (t, i) {
        return i = i || new f(), t.options && i.setOptions(t.options), i.addJSON(t.nested);
      }, f.prototype.resolvePath = v.path.resolve, f.prototype.fetch = v.fetch, f.prototype.load = function t(i, s, e) {
        "function" == typeof s && (e = s, s = nt);
        var o = this;
        if (!e) return v.asPromise(t, o, i, s);
        var u = e === b;
        function f(t, i) {
          if (e) {
            if (u) throw t;
            var n = e;
            e = null, n(t, i);
          }
        }
        function h(t) {
          var i = t.lastIndexOf("google/protobuf/");
          if (-1 < i) {
            t = t.substring(i);
            if (t in p) return t;
          }
          return null;
        }
        function a(t, i) {
          try {
            if (v.isString(i) && "{" == (i[0] || "") && (i = JSON.parse(i)), v.isString(i)) {
              d.filename = t;
              var n,
                r = d(i, o, s),
                e = 0;
              if (r.imports) for (; e < r.imports.length; ++e) (n = h(r.imports[e]) || o.resolvePath(t, r.imports[e])) && c(n);
              if (r.weakImports) for (e = 0; e < r.weakImports.length; ++e) (n = h(r.weakImports[e]) || o.resolvePath(t, r.weakImports[e])) && c(n, !0);
            } else o.setOptions(i.options).addJSON(i.nested);
          } catch (t) {
            f(t);
          }
          u || l || f(null, o);
        }
        function c(n, r) {
          if (n = h(n) || n, !~o.files.indexOf(n)) if (o.files.push(n), n in p) u ? a(n, p[n]) : (++l, setTimeout(function () {
            --l, a(n, p[n]);
          }));else if (u) {
            var t;
            try {
              t = v.fs.readFileSync(n).toString("utf8");
            } catch (t) {
              return void (r || f(t));
            }
            a(n, t);
          } else ++l, o.fetch(n, function (t, i) {
            --l, e && (t ? r ? l || f(null, o) : f(t) : a(n, i));
          });
        }
        var l = 0;
        v.isString(i) && (i = [i]);
        for (var n, r = 0; r < i.length; ++r) (n = o.resolvePath("", i[r])) && c(n);
        return u ? o : (l || f(null, o), nt);
      }, f.prototype.loadSync = function (t, i) {
        if (v.isNode) return this.load(t, i, b);
        throw Error("not supported");
      }, f.prototype.resolveAll = function () {
        if (this.deferred.length) throw Error("unresolvable extensions: " + this.deferred.map(function (t) {
          return "'extend " + t.extend + "' in " + t.parent.fullName;
        }).join(", "));
        return e.prototype.resolveAll.call(this);
      };
      var h = /^[A-Z]/;
      function a(t, i) {
        var n,
          r = i.parent.lookup(i.extend);
        if (r) return n = new s(i.fullName, i.id, i.type, i.rule, nt, i.options), r.get(n.name) || ((n.declaringField = i).extensionField = n, r.add(n)), 1;
      }
      f.prototype.h = function (t) {
        if (t instanceof s) t.extend === nt || t.extensionField || a(0, t) || this.deferred.push(t);else if (t instanceof o) h.test(t.name) && (t.parent[t.name] = t.values);else if (!(t instanceof u)) {
          if (t instanceof r) for (var i = 0; i < this.deferred.length;) a(0, this.deferred[i]) ? this.deferred.splice(i, 1) : ++i;
          for (var n = 0; n < t.nestedArray.length; ++n) this.h(t.f[n]);
          h.test(t.name) && (t.parent[t.name] = t);
        }
      }, f.prototype.a = function (t) {
        var i;
        if (t instanceof s) t.extend !== nt && (t.extensionField ? (t.extensionField.parent.remove(t.extensionField), t.extensionField = null) : -1 < (i = this.deferred.indexOf(t)) && this.deferred.splice(i, 1));else if (t instanceof o) h.test(t.name) && delete t.parent[t.name];else if (t instanceof e) {
          for (var n = 0; n < t.nestedArray.length; ++n) this.a(t.f[n]);
          h.test(t.name) && delete t.parent[t.name];
        }
      }, f.u = function (t, i, n) {
        r = t, d = i, p = n;
      };
    }, {
      15: 15,
      16: 16,
      23: 23,
      25: 25,
      37: 37
    }],
    30: [function (t, i, n) {
      i.exports = {};
    }, {}],
    31: [function (t, i, n) {
      n.Service = t(32);
    }, {
      32: 32
    }],
    32: [function (t, i, n) {
      i.exports = r;
      var u = t(39);
      function r(t, i, n) {
        if ("function" != typeof t) throw TypeError("rpcImpl must be a function");
        u.EventEmitter.call(this), this.rpcImpl = t, this.requestDelimited = !!i, this.responseDelimited = !!n;
      }
      ((r.prototype = Object.create(u.EventEmitter.prototype)).constructor = r).prototype.rpcCall = function t(n, i, r, e, s) {
        if (!e) throw TypeError("request must be specified");
        var o = this;
        if (!s) return u.asPromise(t, o, n, i, r, e);
        if (!o.rpcImpl) return setTimeout(function () {
          s(Error("already ended"));
        }, 0), nt;
        try {
          return o.rpcImpl(n, i[o.requestDelimited ? "encodeDelimited" : "encode"](e).finish(), function (t, i) {
            if (t) return o.emit("error", t, n), s(t);
            if (null === i) return o.end(!0), nt;
            if (!(i instanceof r)) try {
              i = r[o.responseDelimited ? "decodeDelimited" : "decode"](i);
            } catch (t) {
              return o.emit("error", t, n), s(t);
            }
            return o.emit("data", i, n), s(null, i);
          });
        } catch (t) {
          return o.emit("error", t, n), setTimeout(function () {
            s(t);
          }, 0), nt;
        }
      }, r.prototype.end = function (t) {
        return this.rpcImpl && (t || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
      };
    }, {
      39: 39
    }],
    33: [function (t, i, n) {
      i.exports = o;
      var r = t(23),
        s = (((o.prototype = Object.create(r.prototype)).constructor = o).className = "Service", t(22)),
        u = t(37),
        f = t(31);
      function o(t, i) {
        r.call(this, t, i), this.methods = {}, this.l = null;
      }
      function e(t) {
        return t.l = null, t;
      }
      o.fromJSON = function (t, i) {
        var n = new o(t, i.options);
        if (i.methods) for (var r = Object.keys(i.methods), e = 0; e < r.length; ++e) n.add(s.fromJSON(r[e], i.methods[r[e]]));
        return i.nested && n.addJSON(i.nested), n.comment = i.comment, n;
      }, o.prototype.toJSON = function (t) {
        var i = r.prototype.toJSON.call(this, t),
          n = !!t && !!t.keepComments;
        return u.toObject(["options", i && i.options || nt, "methods", r.arrayToJSON(this.methodsArray, t) || {}, "nested", i && i.nested || nt, "comment", n ? this.comment : nt]);
      }, Object.defineProperty(o.prototype, "methodsArray", {
        get: function () {
          return this.l || (this.l = u.toArray(this.methods));
        }
      }), o.prototype.get = function (t) {
        return this.methods[t] || r.prototype.get.call(this, t);
      }, o.prototype.resolveAll = function () {
        for (var t = this.methodsArray, i = 0; i < t.length; ++i) t[i].resolve();
        return r.prototype.resolve.call(this);
      }, o.prototype.add = function (t) {
        if (this.get(t.name)) throw Error("duplicate name '" + t.name + "' in " + this);
        return t instanceof s ? e((this.methods[t.name] = t).parent = this) : r.prototype.add.call(this, t);
      }, o.prototype.remove = function (t) {
        if (t instanceof s) {
          if (this.methods[t.name] !== t) throw Error(t + " is not a member of " + this);
          return delete this.methods[t.name], t.parent = null, e(this);
        }
        return r.prototype.remove.call(this, t);
      }, o.prototype.create = function (t, i, n) {
        for (var r, e = new f.Service(t, i, n), s = 0; s < this.methodsArray.length; ++s) {
          var o = u.lcFirst((r = this.l[s]).resolve().name).replace(/[^$\w_]/g, "");
          e[o] = u.codegen(["r", "c"], u.isReserved(o) ? o + "_" : o)("return this.rpcCall(m,q,s,r,c)")({
            m: r,
            q: r.resolvedRequestType.ctor,
            s: r.resolvedResponseType.ctor
          });
        }
        return e;
      };
    }, {
      22: 22,
      23: 23,
      31: 31,
      37: 37
    }],
    34: [function (t, i, n) {
      i.exports = s;
      var O = /[\s{}=;:[\],'"()<>]/g,
        E = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g,
        A = /(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g,
        x = /^ *[*/]+ */,
        S = /^\s*\*?\/*/,
        T = /\n/g,
        N = /\s/,
        r = /\\(.?)/g,
        e = {
          0: "\0",
          r: "\r",
          n: "\n",
          t: "\t"
        };
      function V(t) {
        return t.replace(r, function (t, i) {
          switch (i) {
            case "\\":
            case "":
              return i;
            default:
              return e[i] || "";
          }
        });
      }
      function s(h, a) {
        h = h.toString();
        var c = 0,
          l = h.length,
          d = 1,
          f = 0,
          p = {},
          v = [],
          b = null;
        function y(t) {
          return Error("illegal " + t + " (line " + d + ")");
        }
        function w(t) {
          return h[0 | t] || "";
        }
        function m(t, i, n) {
          var r,
            e = {
              type: h[0 | t++] || "",
              lineEmpty: !1,
              leading: n
            },
            n = a ? 2 : 3,
            s = t - n;
          do {
            if (--s < 0 || "\n" == (r = h[0 | s] || "")) {
              e.lineEmpty = !0;
              break;
            }
          } while (" " === r || "\t" === r);
          for (var o = h.substring(t, i).split(T), u = 0; u < o.length; ++u) o[u] = o[u].replace(a ? S : x, "").trim();
          e.text = o.join("\n").trim(), p[d] = e, f = d;
        }
        function g(t) {
          var i = j(t),
            t = h.substring(t, i);
          return /^\s*\/\//.test(t);
        }
        function j(t) {
          for (var i = t; i < l && "\n" !== w(i);) i++;
          return i;
        }
        function r() {
          if (0 < v.length) return v.shift();
          if (b) {
            var t = "'" === b ? A : E,
              i = (t.lastIndex = c - 1, t.exec(h));
            if (i) return c = t.lastIndex, k(b), b = null, V(i[1]);
            throw y("string");
          }
          var n,
            r,
            e,
            s,
            o,
            u = 0 === c;
          do {
            if (c === l) return null;
            for (n = !1; N.test(e = w(c));) if ("\n" === e && (u = !0, ++d), ++c === l) return null;
            if ("/" === w(c)) {
              if (++c === l) throw y("comment");
              if ("/" === w(c)) {
                if (a) {
                  if (o = !1, g((s = c) - 1)) for (o = !0; (c = j(c)) !== l && (c++, u && g(c)););else c = Math.min(l, j(c) + 1);
                  o && (m(s, c, u), u = !0), d++;
                } else {
                  for (o = "/" === w(s = c + 1); "\n" !== w(++c);) if (c === l) return null;
                  ++c, o && (m(s, c - 1, u), u = !0), ++d;
                }
              } else {
                if ("*" !== (e = w(c))) return "/";
                s = c + 1, o = a || "*" === w(s);
                do {
                  if ("\n" === e && ++d, ++c === l) throw y("comment");
                } while ((r = e, e = w(c), "*" !== r || "/" !== e));
                ++c, o && (m(s, c - 2, u), u = !0);
              }
              n = !0;
            }
          } while (n);
          var f = c;
          if (O.lastIndex = 0, !O.test(w(f++))) for (; f < l && !O.test(w(f));) ++f;
          t = h.substring(c, c = f);
          return '"' != t && "'" != t || (b = t), t;
        }
        function k(t) {
          v.push(t);
        }
        function e() {
          if (!v.length) {
            var t = r();
            if (null === t) return null;
            k(t);
          }
          return v[0];
        }
        return Object.defineProperty({
          next: r,
          peek: e,
          push: k,
          skip: function (t, i) {
            var n = e();
            if (n === t) return r(), !0;
            if (i) return !1;
            throw y("token '" + n + "', '" + t + "' expected");
          },
          cmnt: function (t) {
            var i,
              n = null;
            return t === nt ? (i = p[d - 1], delete p[d - 1], i && (a || "*" === i.type || i.lineEmpty) && (n = i.leading ? i.text : null)) : (f < t && e(), i = p[t], delete p[t], !i || i.lineEmpty || !a && "/" !== i.type || (n = i.leading ? null : i.text)), n;
          }
        }, "line", {
          get: function () {
            return d;
          }
        });
      }
      s.unescape = V;
    }, {}],
    35: [function (t, i, n) {
      i.exports = m;
      var o = t(23),
        u = (((m.prototype = Object.create(o.prototype)).constructor = m).className = "Type", t(15)),
        f = t(25),
        h = t(16),
        a = t(20),
        c = t(33),
        e = t(21),
        s = t(27),
        l = t(42),
        d = t(37),
        p = t(14),
        v = t(13),
        b = t(40),
        y = t(12),
        w = t(41);
      function m(t, i) {
        o.call(this, t, i), this.fields = {}, this.oneofs = nt, this.extensions = nt, this.reserved = nt, this.group = nt, this.p = null, this.e = null, this.v = null, this.b = null;
      }
      function r(t) {
        return t.p = t.e = t.v = null, delete t.encode, delete t.decode, delete t.verify, t;
      }
      Object.defineProperties(m.prototype, {
        fieldsById: {
          get: function () {
            if (!this.p) {
              this.p = {};
              for (var t = Object.keys(this.fields), i = 0; i < t.length; ++i) {
                var n = this.fields[t[i]],
                  r = n.id;
                if (this.p[r]) throw Error("duplicate id " + r + " in " + this);
                this.p[r] = n;
              }
            }
            return this.p;
          }
        },
        fieldsArray: {
          get: function () {
            return this.e || (this.e = d.toArray(this.fields));
          }
        },
        oneofsArray: {
          get: function () {
            return this.v || (this.v = d.toArray(this.oneofs));
          }
        },
        ctor: {
          get: function () {
            return this.b || (this.ctor = m.generateConstructor(this)());
          },
          set: function (t) {
            for (var i = t.prototype, n = (i instanceof e || ((t.prototype = new e()).constructor = t, d.merge(t.prototype, i)), t.$type = t.prototype.$type = this, d.merge(t, e, !0), this.b = t, 0); n < this.fieldsArray.length; ++n) this.e[n].resolve();
            for (var r = {}, n = 0; n < this.oneofsArray.length; ++n) r[this.v[n].resolve().name] = {
              get: d.oneOfGetter(this.v[n].oneof),
              set: d.oneOfSetter(this.v[n].oneof)
            };
            n && Object.defineProperties(t.prototype, r);
          }
        }
      }), m.generateConstructor = function (t) {
        for (var i, n = d.codegen(["p"], t.name), r = 0; r < t.fieldsArray.length; ++r) (i = t.e[r]).map ? n("this%s={}", d.safeProp(i.name)) : i.repeated && n("this%s=[]", d.safeProp(i.name));
        return n("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]");
      }, m.fromJSON = function (t, i) {
        for (var n = new m(t, i.options), r = (n.extensions = i.extensions, n.reserved = i.reserved, Object.keys(i.fields)), e = 0; e < r.length; ++e) n.add((void 0 !== i.fields[r[e]].keyType ? a : h).fromJSON(r[e], i.fields[r[e]]));
        if (i.oneofs) for (r = Object.keys(i.oneofs), e = 0; e < r.length; ++e) n.add(f.fromJSON(r[e], i.oneofs[r[e]]));
        if (i.nested) for (r = Object.keys(i.nested), e = 0; e < r.length; ++e) {
          var s = i.nested[r[e]];
          n.add((s.id !== nt ? h : s.fields !== nt ? m : s.values !== nt ? u : s.methods !== nt ? c : o).fromJSON(r[e], s));
        }
        return i.extensions && i.extensions.length && (n.extensions = i.extensions), i.reserved && i.reserved.length && (n.reserved = i.reserved), i.group && (n.group = !0), i.comment && (n.comment = i.comment), n;
      }, m.prototype.toJSON = function (t) {
        var i = o.prototype.toJSON.call(this, t),
          n = !!t && !!t.keepComments;
        return d.toObject(["options", i && i.options || nt, "oneofs", o.arrayToJSON(this.oneofsArray, t), "fields", o.arrayToJSON(this.fieldsArray.filter(function (t) {
          return !t.declaringField;
        }), t) || {}, "extensions", this.extensions && this.extensions.length ? this.extensions : nt, "reserved", this.reserved && this.reserved.length ? this.reserved : nt, "group", this.group || nt, "nested", i && i.nested || nt, "comment", n ? this.comment : nt]);
      }, m.prototype.resolveAll = function () {
        for (var t = this.fieldsArray, i = 0; i < t.length;) t[i++].resolve();
        for (var n = this.oneofsArray, i = 0; i < n.length;) n[i++].resolve();
        return o.prototype.resolveAll.call(this);
      }, m.prototype.get = function (t) {
        return this.fields[t] || this.oneofs && this.oneofs[t] || this.nested && this.nested[t] || null;
      }, m.prototype.add = function (t) {
        if (this.get(t.name)) throw Error("duplicate name '" + t.name + "' in " + this);
        if (t instanceof h && t.extend === nt) {
          if ((this.p || this.fieldsById)[t.id]) throw Error("duplicate id " + t.id + " in " + this);
          if (this.isReservedId(t.id)) throw Error("id " + t.id + " is reserved in " + this);
          if (this.isReservedName(t.name)) throw Error("name '" + t.name + "' is reserved in " + this);
          return t.parent && t.parent.remove(t), (this.fields[t.name] = t).message = this, t.onAdd(this), r(this);
        }
        return t instanceof f ? (this.oneofs || (this.oneofs = {}), (this.oneofs[t.name] = t).onAdd(this), r(this)) : o.prototype.add.call(this, t);
      }, m.prototype.remove = function (t) {
        if (t instanceof h && t.extend === nt) {
          if (this.fields && this.fields[t.name] === t) return delete this.fields[t.name], t.parent = null, t.onRemove(this), r(this);
          throw Error(t + " is not a member of " + this);
        }
        if (t instanceof f) {
          if (this.oneofs && this.oneofs[t.name] === t) return delete this.oneofs[t.name], t.parent = null, t.onRemove(this), r(this);
          throw Error(t + " is not a member of " + this);
        }
        return o.prototype.remove.call(this, t);
      }, m.prototype.isReservedId = function (t) {
        return o.isReservedId(this.reserved, t);
      }, m.prototype.isReservedName = function (t) {
        return o.isReservedName(this.reserved, t);
      }, m.prototype.create = function (t) {
        return new this.ctor(t);
      }, m.prototype.setup = function () {
        for (var t = this.fullName, i = [], n = 0; n < this.fieldsArray.length; ++n) i.push(this.e[n].resolve().resolvedType);
        this.encode = p(this)({
          Writer: l,
          types: i,
          util: d
        }), this.decode = v(this)({
          Reader: s,
          types: i,
          util: d
        }), this.verify = b(this)({
          types: i,
          util: d
        }), this.fromObject = y.fromObject(this)({
          types: i,
          util: d
        }), this.toObject = y.toObject(this)({
          types: i,
          util: d
        });
        var r,
          t = w[t];
        return t && ((r = Object.create(this)).fromObject = this.fromObject, this.fromObject = t.fromObject.bind(r), r.toObject = this.toObject, this.toObject = t.toObject.bind(r)), this;
      }, m.prototype.encode = function (t, i) {
        return this.setup().encode(t, i);
      }, m.prototype.encodeDelimited = function (t, i) {
        return this.encode(t, i && i.len ? i.fork() : i).ldelim();
      }, m.prototype.decode = function (t, i) {
        return this.setup().decode(t, i);
      }, m.prototype.decodeDelimited = function (t) {
        return t instanceof s || (t = s.create(t)), this.decode(t, t.uint32());
      }, m.prototype.verify = function (t) {
        return this.setup().verify(t);
      }, m.prototype.fromObject = function (t) {
        return this.setup().fromObject(t);
      }, m.prototype.toObject = function (t, i) {
        return this.setup().toObject(t, i);
      }, m.d = function (i) {
        return function (t) {
          d.decorateType(t, i);
        };
      };
    }, {
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      20: 20,
      21: 21,
      23: 23,
      25: 25,
      27: 27,
      33: 33,
      37: 37,
      40: 40,
      41: 41,
      42: 42
    }],
    36: [function (t, i, n) {
      var t = t(37),
        e = ["double", "float", "int32", "uint32", "sint32", "fixed32", "sfixed32", "int64", "uint64", "sint64", "fixed64", "sfixed64", "bool", "string", "bytes"];
      function r(t, i) {
        var n = 0,
          r = {};
        for (i |= 0; n < t.length;) r[e[n + i]] = t[n++];
        return r;
      }
      n.basic = r([1, 5, 0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0, 2, 2]), n.defaults = r([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, !1, "", t.emptyArray, null]), n.long = r([0, 0, 0, 1, 1], 7), n.mapKey = r([0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0, 2], 2), n.packed = r([1, 5, 0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0]);
    }, {
      37: 37
    }],
    37: [function (n, t, i) {
      var r,
        e,
        s = t.exports = n(39),
        o = n(30),
        u = (s.codegen = n(3), s.fetch = n(5), s.path = n(8), s.fs = s.inquire("fs"), s.toArray = function (t) {
          if (t) {
            for (var i = Object.keys(t), n = Array(i.length), r = 0; r < i.length;) n[r] = t[i[r++]];
            return n;
          }
          return [];
        }, s.toObject = function (t) {
          for (var i = {}, n = 0; n < t.length;) {
            var r = t[n++],
              e = t[n++];
            e !== nt && (i[r] = e);
          }
          return i;
        }, /\\/g),
        f = /"/g,
        h = (s.isReserved = function (t) {
          return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(t);
        }, s.safeProp = function (t) {
          return !/^[$\w_]+$/.test(t) || s.isReserved(t) ? '["' + t.replace(u, "\\\\").replace(f, '\\"') + '"]' : "." + t;
        }, s.ucFirst = function (t) {
          return (t[0] || "").toUpperCase() + t.substring(1);
        }, /_([a-z])/g),
        a = (s.camelCase = function (t) {
          return t.substring(0, 1) + t.substring(1).replace(h, function (t, i) {
            return i.toUpperCase();
          });
        }, s.compareFieldsById = function (t, i) {
          return t.id - i.id;
        }, s.decorateType = function (t, i) {
          return t.$type ? (i && t.$type.name !== i && (s.decorateRoot.remove(t.$type), t.$type.name = i, s.decorateRoot.add(t.$type)), t.$type) : (i = new (r = r || n(35))(i || t.name), s.decorateRoot.add(i), i.ctor = t, Object.defineProperty(t, "$type", {
            value: i,
            enumerable: !1
          }), Object.defineProperty(t.prototype, "$type", {
            value: i,
            enumerable: !1
          }), i);
        }, 0);
      s.decorateEnum = function (t) {
        var i;
        return t.$type || (i = new (e = e || n(15))("Enum" + a++, t), s.decorateRoot.add(i), Object.defineProperty(t, "$type", {
          value: i,
          enumerable: !1
        }), i);
      }, s.setProperty = function (t, i, n) {
        if ("object" != typeof t) throw TypeError("dst must be an object");
        if (i) return function t(i, n, r) {
          var e = n.shift();
          return "__proto__" !== e && "prototype" !== e && (0 < n.length ? i[e] = t(i[e] || {}, n, r) : ((n = i[e]) && (r = [].concat(n).concat(r)), i[e] = r)), i;
        }(t, i = i.split("."), n);
        throw TypeError("path must be specified");
      }, Object.defineProperty(s, "decorateRoot", {
        get: function () {
          return o.decorated || (o.decorated = new (n(29))());
        }
      });
    }, {
      15: 15,
      29: 29,
      3: 3,
      30: 30,
      35: 35,
      39: 39,
      5: 5,
      8: 8
    }],
    38: [function (t, i, n) {
      i.exports = e;
      var r = t(39);
      function e(t, i) {
        this.lo = t >>> 0, this.hi = i >>> 0;
      }
      var s = e.zero = new e(0, 0),
        o = (s.toNumber = function () {
          return 0;
        }, s.zzEncode = s.zzDecode = function () {
          return this;
        }, s.length = function () {
          return 1;
        }, e.zeroHash = "\0\0\0\0\0\0\0\0", e.fromNumber = function (t) {
          var i, n;
          return 0 === t ? s : (n = (t = (i = t < 0) ? -t : t) >>> 0, t = (t - n) / 4294967296 >>> 0, i && (t = ~t >>> 0, n = ~n >>> 0, 4294967295 < ++n && (n = 0, 4294967295 < ++t && (t = 0))), new e(n, t));
        }, e.from = function (t) {
          if ("number" == typeof t) return e.fromNumber(t);
          if (r.isString(t)) {
            if (!r.Long) return e.fromNumber(parseInt(t, 10));
            t = r.Long.fromString(t);
          }
          return t.low || t.high ? new e(t.low >>> 0, t.high >>> 0) : s;
        }, e.prototype.toNumber = function (t) {
          var i;
          return !t && this.hi >>> 31 ? (t = 1 + ~this.lo >>> 0, i = ~this.hi >>> 0, -(t + 4294967296 * (i = t ? i : i + 1 >>> 0))) : this.lo + 4294967296 * this.hi;
        }, e.prototype.toLong = function (t) {
          return r.Long ? new r.Long(0 | this.lo, 0 | this.hi, !!t) : {
            low: 0 | this.lo,
            high: 0 | this.hi,
            unsigned: !!t
          };
        }, String.prototype.charCodeAt);
      e.fromHash = function (t) {
        return "\0\0\0\0\0\0\0\0" === t ? s : new e((o.call(t, 0) | o.call(t, 1) << 8 | o.call(t, 2) << 16 | o.call(t, 3) << 24) >>> 0, (o.call(t, 4) | o.call(t, 5) << 8 | o.call(t, 6) << 16 | o.call(t, 7) << 24) >>> 0);
      }, e.prototype.toHash = function () {
        return String.fromCharCode(255 & this.lo, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, 255 & this.hi, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24);
      }, e.prototype.zzEncode = function () {
        var t = this.hi >> 31;
        return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ t) >>> 0, this.lo = (this.lo << 1 ^ t) >>> 0, this;
      }, e.prototype.zzDecode = function () {
        var t = -(1 & this.lo);
        return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ t) >>> 0, this.hi = (this.hi >>> 1 ^ t) >>> 0, this;
      }, e.prototype.length = function () {
        var t = this.lo,
          i = (this.lo >>> 28 | this.hi << 4) >>> 0,
          n = this.hi >>> 24;
        return 0 == n ? 0 == i ? t < 16384 ? t < 128 ? 1 : 2 : t < 2097152 ? 3 : 4 : i < 16384 ? i < 128 ? 5 : 6 : i < 2097152 ? 7 : 8 : n < 128 ? 9 : 10;
      };
    }, {
      39: 39
    }],
    39: [function (t, i, n) {
      var r = n;
      function e(t, i, n) {
        for (var r = Object.keys(i), e = 0; e < r.length; ++e) t[r[e]] !== nt && n || (t[r[e]] = i[r[e]]);
        return t;
      }
      function s(t) {
        function n(t, i) {
          if (!(this instanceof n)) return new n(t, i);
          Object.defineProperty(this, "message", {
            get: function () {
              return t;
            }
          }), Error.captureStackTrace ? Error.captureStackTrace(this, n) : Object.defineProperty(this, "stack", {
            value: Error().stack || ""
          }), i && e(this, i);
        }
        return n.prototype = Object.create(Error.prototype, {
          constructor: {
            value: n,
            writable: !0,
            enumerable: !1,
            configurable: !0
          },
          name: {
            get: function () {
              return t;
            },
            set: nt,
            enumerable: !1,
            configurable: !0
          },
          toString: {
            value: function () {
              return this.name + ": " + this.message;
            },
            writable: !0,
            enumerable: !1,
            configurable: !0
          }
        }), n;
      }
      r.asPromise = t(1), r.base64 = t(2), r.EventEmitter = t(4), r.float = t(6), r.inquire = t(7), r.utf8 = t(10), r.pool = t(9), r.LongBits = t(38), r.isNode = !!("undefined" != typeof global && global && global.process && global.process.versions && global.process.versions.node), r.global = r.isNode && global || "undefined" != typeof window && window || "undefined" != typeof self && self || this, r.emptyArray = Object.freeze ? Object.freeze([]) : [], r.emptyObject = Object.freeze ? Object.freeze({}) : {}, r.isInteger = Number.isInteger || function (t) {
        return "number" == typeof t && isFinite(t) && Math.floor(t) === t;
      }, r.isString = function (t) {
        return "string" == typeof t || t instanceof String;
      }, r.isObject = function (t) {
        return t && "object" == typeof t;
      }, r.isset = r.isSet = function (t, i) {
        var n = t[i];
        return null != n && t.hasOwnProperty(i) && ("object" != typeof n || 0 < (Array.isArray(n) ? n : Object.keys(n)).length);
      }, r.Buffer = function () {
        try {
          var t = r.inquire("buffer").Buffer;
          return t.prototype.utf8Write ? t : null;
        } catch (t) {
          return null;
        }
      }(), r.y = null, r.w = null, r.newBuffer = function (t) {
        return "number" == typeof t ? r.Buffer ? r.w(t) : new r.Array(t) : r.Buffer ? r.y(t) : "undefined" == typeof Uint8Array ? t : new Uint8Array(t);
      }, r.Array = "undefined" != typeof Uint8Array ? Uint8Array : Array, r.Long = r.global.dcodeIO && r.global.dcodeIO.Long || r.global.Long || r.inquire("long"), r.key2Re = /^true|false|0|1$/, r.key32Re = /^-?(?:0|[1-9][0-9]*)$/, r.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/, r.longToHash = function (t) {
        return t ? r.LongBits.from(t).toHash() : r.LongBits.zeroHash;
      }, r.longFromHash = function (t, i) {
        t = r.LongBits.fromHash(t);
        return r.Long ? r.Long.fromBits(t.lo, t.hi, i) : t.toNumber(!!i);
      }, r.merge = e, r.lcFirst = function (t) {
        return (t[0] || "").toLowerCase() + t.substring(1);
      }, r.newError = s, r.ProtocolError = s("ProtocolError"), r.oneOfGetter = function (t) {
        for (var n = {}, i = 0; i < t.length; ++i) n[t[i]] = 1;
        return function () {
          for (var t = Object.keys(this), i = t.length - 1; -1 < i; --i) if (1 === n[t[i]] && this[t[i]] !== nt && null !== this[t[i]]) return t[i];
        };
      }, r.oneOfSetter = function (n) {
        return function (t) {
          for (var i = 0; i < n.length; ++i) n[i] !== t && delete this[n[i]];
        };
      }, r.toJSONOptions = {
        longs: String,
        enums: String,
        bytes: String,
        json: !0
      }, r.u = function () {
        var n = r.Buffer;
        n ? (r.y = n.from !== Uint8Array.from && n.from || function (t, i) {
          return new n(t, i);
        }, r.w = n.allocUnsafe || function (t) {
          return new n(t);
        }) : r.y = r.w = null;
      };
    }, {
      1: 1,
      10: 10,
      2: 2,
      38: 38,
      4: 4,
      6: 6,
      7: 7,
      9: 9
    }],
    40: [function (t, i, n) {
      i.exports = function (t) {
        var i = f.codegen(["m"], t.name + "$verify")('if(typeof m!=="object"||m===null)')("return%j", "object expected"),
          n = t.oneofsArray,
          r = {};
        n.length && i("var p={}");
        for (var e = 0; e < t.fieldsArray.length; ++e) {
          var s,
            o = t.e[e].resolve(),
            u = "m" + f.safeProp(o.name);
          o.optional && i("if(%s!=null&&m.hasOwnProperty(%j)){", u, o.name), o.map ? (i("if(!util.isObject(%s))", u)("return%j", h(o, "object"))("var k=Object.keys(%s)", u)("for(var i=0;i<k.length;++i){"), function (t, i, n) {
            switch (i.keyType) {
              case "int32":
              case "uint32":
              case "sint32":
              case "fixed32":
              case "sfixed32":
                t("if(!util.key32Re.test(%s))", n)("return%j", h(i, "integer key"));
                break;
              case "int64":
              case "uint64":
              case "sint64":
              case "fixed64":
              case "sfixed64":
                t("if(!util.key64Re.test(%s))", n)("return%j", h(i, "integer|Long key"));
                break;
              case "bool":
                t("if(!util.key2Re.test(%s))", n)("return%j", h(i, "boolean key"));
            }
          }(i, o, "k[i]"), a(i, o, e, u + "[k[i]]")("}")) : o.repeated ? (i("if(!Array.isArray(%s))", u)("return%j", h(o, "array"))("for(var i=0;i<%s.length;++i){", u), a(i, o, e, u + "[i]")("}")) : (o.partOf && (s = f.safeProp(o.partOf.name), 1 === r[o.partOf.name] && i("if(p%s===1)", s)("return%j", o.partOf.name + ": multiple values"), r[o.partOf.name] = 1, i("p%s=1", s)), a(i, o, e, u)), o.optional && i("}");
        }
        return i("return null");
      };
      var o = t(15),
        f = t(37);
      function h(t, i) {
        return t.name + ": " + i + (t.repeated && "array" !== i ? "[]" : t.map && "object" !== i ? "{k:" + t.keyType + "}" : "") + " expected";
      }
      function a(t, i, n, r) {
        if (i.resolvedType) {
          if (i.resolvedType instanceof o) {
            t("switch(%s){", r)("default:")("return%j", h(i, "enum value"));
            for (var e = Object.keys(i.resolvedType.values), s = 0; s < e.length; ++s) t("case %i:", i.resolvedType.values[e[s]]);
            t("break")("}");
          } else t("{")("var e=types[%i].verify(%s);", n, r)("if(e)")("return%j+e", i.name + ".")("}");
        } else switch (i.type) {
          case "int32":
          case "uint32":
          case "sint32":
          case "fixed32":
          case "sfixed32":
            t("if(!util.isInteger(%s))", r)("return%j", h(i, "integer"));
            break;
          case "int64":
          case "uint64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            t("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))", r, r, r, r)("return%j", h(i, "integer|Long"));
            break;
          case "float":
          case "double":
            t('if(typeof %s!=="number")', r)("return%j", h(i, "number"));
            break;
          case "bool":
            t('if(typeof %s!=="boolean")', r)("return%j", h(i, "boolean"));
            break;
          case "string":
            t("if(!util.isString(%s))", r)("return%j", h(i, "string"));
            break;
          case "bytes":
            t('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))', r, r, r)("return%j", h(i, "buffer"));
        }
        return t;
      }
    }, {
      15: 15,
      37: 37
    }],
    41: [function (t, i, n) {
      var o = t(21);
      n[".google.protobuf.Any"] = {
        fromObject: function (t) {
          if (t && t["@type"]) {
            var i,
              n = t["@type"].substring(1 + t["@type"].lastIndexOf("/")),
              n = this.lookup(n);
            if (n) return ~(i = "." == (t["@type"][0] || "") ? t["@type"].slice(1) : t["@type"]).indexOf("/") || (i = "/" + i), this.create({
              type_url: i,
              value: n.encode(n.fromObject(t)).finish()
            });
          }
          return this.fromObject(t);
        },
        toObject: function (t, i) {
          var n,
            r,
            e = "",
            s = "";
          return i && i.json && t.type_url && t.value && (s = t.type_url.substring(1 + t.type_url.lastIndexOf("/")), e = t.type_url.substring(0, 1 + t.type_url.lastIndexOf("/")), (n = this.lookup(s)) && (t = n.decode(t.value))), !(t instanceof this.ctor) && t instanceof o ? (n = t.$type.toObject(t, i), r = "." === t.$type.fullName[0] ? t.$type.fullName.slice(1) : t.$type.fullName, n["@type"] = s = (e = "" === e ? "type.googleapis.com/" : e) + r, n) : this.toObject(t, i);
        }
      };
    }, {
      21: 21
    }],
    42: [function (t, i, n) {
      i.exports = c;
      var r,
        e = t(39),
        s = e.LongBits,
        o = e.base64,
        u = e.utf8;
      function f(t, i, n) {
        this.fn = t, this.len = i, this.next = nt, this.val = n;
      }
      function h() {}
      function a(t) {
        this.head = t.head, this.tail = t.tail, this.len = t.len, this.next = t.states;
      }
      function c() {
        this.len = 0, this.head = new f(h, 0, 0), this.tail = this.head, this.states = null;
      }
      function l() {
        return e.Buffer ? function () {
          return (c.create = function () {
            return new r();
          })();
        } : function () {
          return new c();
        };
      }
      function d(t, i, n) {
        i[n] = 255 & t;
      }
      function p(t, i) {
        this.len = t, this.next = nt, this.val = i;
      }
      function v(t, i, n) {
        for (; t.hi;) i[n++] = 127 & t.lo | 128, t.lo = (t.lo >>> 7 | t.hi << 25) >>> 0, t.hi >>>= 7;
        for (; 127 < t.lo;) i[n++] = 127 & t.lo | 128, t.lo = t.lo >>> 7;
        i[n++] = t.lo;
      }
      function b(t, i, n) {
        i[n] = 255 & t, i[n + 1] = t >>> 8 & 255, i[n + 2] = t >>> 16 & 255, i[n + 3] = t >>> 24;
      }
      c.create = l(), c.alloc = function (t) {
        return new e.Array(t);
      }, e.Array !== Array && (c.alloc = e.pool(c.alloc, e.Array.prototype.subarray)), c.prototype.g = function (t, i, n) {
        return this.tail = this.tail.next = new f(t, i, n), this.len += i, this;
      }, (p.prototype = Object.create(f.prototype)).fn = function (t, i, n) {
        for (; 127 < t;) i[n++] = 127 & t | 128, t >>>= 7;
        i[n] = t;
      }, c.prototype.uint32 = function (t) {
        return this.len += (this.tail = this.tail.next = new p((t >>>= 0) < 128 ? 1 : t < 16384 ? 2 : t < 2097152 ? 3 : t < 268435456 ? 4 : 5, t)).len, this;
      }, c.prototype.int32 = function (t) {
        return t < 0 ? this.g(v, 10, s.fromNumber(t)) : this.uint32(t);
      }, c.prototype.sint32 = function (t) {
        return this.uint32((t << 1 ^ t >> 31) >>> 0);
      }, c.prototype.int64 = c.prototype.uint64 = function (t) {
        t = s.from(t);
        return this.g(v, t.length(), t);
      }, c.prototype.sint64 = function (t) {
        t = s.from(t).zzEncode();
        return this.g(v, t.length(), t);
      }, c.prototype.bool = function (t) {
        return this.g(d, 1, t ? 1 : 0);
      }, c.prototype.sfixed32 = c.prototype.fixed32 = function (t) {
        return this.g(b, 4, t >>> 0);
      }, c.prototype.sfixed64 = c.prototype.fixed64 = function (t) {
        t = s.from(t);
        return this.g(b, 4, t.lo).g(b, 4, t.hi);
      }, c.prototype.float = function (t) {
        return this.g(e.float.writeFloatLE, 4, t);
      }, c.prototype.double = function (t) {
        return this.g(e.float.writeDoubleLE, 8, t);
      };
      var y = e.Array.prototype.set ? function (t, i, n) {
        i.set(t, n);
      } : function (t, i, n) {
        for (var r = 0; r < t.length; ++r) i[n + r] = t[r];
      };
      c.prototype.bytes = function (t) {
        var i,
          n = t.length >>> 0;
        return n ? (e.isString(t) && (i = c.alloc(n = o.length(t)), o.decode(t, i, 0), t = i), this.uint32(n).g(y, n, t)) : this.g(d, 1, 0);
      }, c.prototype.string = function (t) {
        var i = u.length(t);
        return i ? this.uint32(i).g(u.write, i, t) : this.g(d, 1, 0);
      }, c.prototype.fork = function () {
        return this.states = new a(this), this.head = this.tail = new f(h, 0, 0), this.len = 0, this;
      }, c.prototype.reset = function () {
        return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new f(h, 0, 0), this.len = 0), this;
      }, c.prototype.ldelim = function () {
        var t = this.head,
          i = this.tail,
          n = this.len;
        return this.reset().uint32(n), n && (this.tail.next = t.next, this.tail = i, this.len += n), this;
      }, c.prototype.finish = function () {
        for (var t = this.head.next, i = this.constructor.alloc(this.len), n = 0; t;) t.fn(t.val, i, n), n += t.len, t = t.next;
        return i;
      }, c.u = function (t) {
        r = t, c.create = l(), r.u();
      };
    }, {
      39: 39
    }],
    43: [function (t, i, n) {
      i.exports = s;
      var r = t(42),
        e = ((s.prototype = Object.create(r.prototype)).constructor = s, t(39));
      function s() {
        r.call(this);
      }
      function o(t, i, n) {
        t.length < 40 ? e.utf8.write(t, i, n) : i.utf8Write ? i.utf8Write(t, n) : i.write(t, n);
      }
      s.u = function () {
        s.alloc = e.w, s.writeBytesBuffer = e.Buffer && e.Buffer.prototype instanceof Uint8Array && "set" === e.Buffer.prototype.set.name ? function (t, i, n) {
          i.set(t, n);
        } : function (t, i, n) {
          if (t.copy) t.copy(i, n, 0, t.length);else for (var r = 0; r < t.length;) i[n++] = t[r++];
        };
      }, s.prototype.bytes = function (t) {
        var i = (t = e.isString(t) ? e.y(t, "base64") : t).length >>> 0;
        return this.uint32(i), i && this.g(s.writeBytesBuffer, i, t), this;
      }, s.prototype.string = function (t) {
        var i = e.Buffer.byteLength(t);
        return this.uint32(i), i && this.g(o, i, t), this;
      }, s.u();
    }, {
      39: 39,
      42: 42
    }]
  }, {}, [19]);
}();
var $protobuf = {
  ...JProtobuf
};

/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
const $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root())).addJSON({
  codec: {
    nested: {
      ConnectMsgBody: {
        fields: {
          protoId: {
            type: "string",
            id: 1
          },
          sdkVersion: {
            type: "string",
            id: 2
          },
          appkey: {
            type: "string",
            id: 3
          },
          token: {
            type: "string",
            id: 4
          },
          deviceId: {
            type: "string",
            id: 5
          },
          platform: {
            type: "string",
            id: 6
          },
          deviceCompany: {
            type: "string",
            id: 7
          },
          deviceModel: {
            type: "string",
            id: 8
          },
          deviceOsVersion: {
            type: "string",
            id: 9
          },
          pushToken: {
            type: "string",
            id: 10
          },
          networkId: {
            type: "string",
            id: 11
          },
          ispNum: {
            type: "string",
            id: 12
          },
          clientIp: {
            type: "string",
            id: 13
          },
          packageName: {
            type: "string",
            id: 14
          },
          pushChannel: {
            type: "string",
            id: 15
          },
          ext: {
            type: "string",
            id: 16
          },
          clientSession: {
            type: "string",
            id: 17
          }
        }
      },
      ConnectAckMsgBody: {
        fields: {
          code: {
            type: "int32",
            id: 1
          },
          userId: {
            type: "string",
            id: 2
          },
          session: {
            type: "string",
            id: 3
          },
          timestamp: {
            type: "int64",
            id: 4
          },
          ext: {
            type: "string",
            id: 5
          }
        }
      },
      DisconnectMsgBody: {
        fields: {
          code: {
            type: "int32",
            id: 1
          },
          timestamp: {
            type: "int64",
            id: 2
          },
          ext: {
            type: "string",
            id: 3
          }
        }
      },
      PublishMsgBody: {
        fields: {
          index: {
            type: "int32",
            id: 1
          },
          topic: {
            type: "string",
            id: 2
          },
          targetId: {
            type: "string",
            id: 3
          },
          timestamp: {
            type: "int64",
            id: 4
          },
          data: {
            type: "bytes",
            id: 5
          }
        }
      },
      PublishAckMsgBody: {
        fields: {
          index: {
            type: "int32",
            id: 1
          },
          code: {
            type: "int32",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          },
          timestamp: {
            type: "int64",
            id: 4
          },
          msgIndex: {
            type: "int64",
            id: 5
          },
          memberCount: {
            type: "int32",
            id: 6
          },
          clientMsgId: {
            type: "string",
            id: 7
          },
          modifiedMsg: {
            type: "DownMsg",
            id: 8
          }
        }
      },
      QueryMsgBody: {
        fields: {
          index: {
            type: "int32",
            id: 1
          },
          topic: {
            type: "string",
            id: 2
          },
          targetId: {
            type: "string",
            id: 3
          },
          timestamp: {
            type: "int64",
            id: 4
          },
          data: {
            type: "bytes",
            id: 5
          }
        }
      },
      QueryAckMsgBody: {
        fields: {
          index: {
            type: "int32",
            id: 1
          },
          code: {
            type: "int32",
            id: 2
          },
          timestamp: {
            type: "int64",
            id: 3
          },
          data: {
            type: "bytes",
            id: 4
          }
        }
      },
      QueryConfirmMsgBody: {
        fields: {
          index: {
            type: "int32",
            id: 1
          }
        }
      },
      ImWebsocketMsg: {
        oneofs: {
          testof: {
            oneof: ["connectMsgBody", "ConnectAckMsgBody", "disconnectMsgBody", "publishMsgBody", "pubAckMsgBody", "qryMsgBody", "qryAckMsgBody", "qryConfirmMsgBody"]
          }
        },
        fields: {
          version: {
            type: "int32",
            id: 1
          },
          cmd: {
            type: "int32",
            id: 2
          },
          qos: {
            type: "int32",
            id: 3
          },
          payload: {
            type: "bytes",
            id: 4
          },
          connectMsgBody: {
            type: "ConnectMsgBody",
            id: 11
          },
          ConnectAckMsgBody: {
            type: "ConnectAckMsgBody",
            id: 12
          },
          disconnectMsgBody: {
            type: "DisconnectMsgBody",
            id: 13
          },
          publishMsgBody: {
            type: "PublishMsgBody",
            id: 14
          },
          pubAckMsgBody: {
            type: "PublishAckMsgBody",
            id: 15
          },
          qryMsgBody: {
            type: "QueryMsgBody",
            id: 16
          },
          qryAckMsgBody: {
            type: "QueryAckMsgBody",
            id: 17
          },
          qryConfirmMsgBody: {
            type: "QueryConfirmMsgBody",
            id: 18
          }
        }
      },
      ChannelType: {
        values: {
          Private: 1,
          Group: 2,
          Chatroom: 3,
          System: 4
        }
      },
      PushData: {
        fields: {
          title: {
            type: "string",
            id: 1
          },
          pushId: {
            type: "string",
            id: 2
          },
          pushText: {
            type: "string",
            id: 3
          },
          pushExtraData: {
            type: "string",
            id: 4
          }
        }
      },
      QryHisMsgsReq: {
        fields: {
          converId: {
            type: "string",
            id: 1
          },
          type: {
            type: "ChannelType",
            id: 2
          },
          startTime: {
            type: "int64",
            id: 3
          },
          count: {
            type: "int32",
            id: 4
          },
          order: {
            type: "int32",
            id: 5
          },
          msgTypes: {
            rule: "repeated",
            type: "string",
            id: 6
          }
        }
      },
      DownMsgSet: {
        fields: {
          msgs: {
            rule: "repeated",
            type: "DownMsg",
            id: 1
          },
          syncTime: {
            type: "int64",
            id: 2
          },
          isFinished: {
            type: "bool",
            id: 3
          },
          targetUserInfo: {
            type: "UserInfo",
            id: 4
          },
          groupInfo: {
            type: "GroupInfo",
            id: 5
          }
        }
      },
      UpMsg: {
        fields: {
          msgType: {
            type: "string",
            id: 1
          },
          msgContent: {
            type: "bytes",
            id: 2
          },
          flags: {
            type: "int32",
            id: 3
          },
          clientUid: {
            type: "string",
            id: 4
          },
          pushData: {
            type: "PushData",
            id: 5
          },
          mentionInfo: {
            type: "MentionInfo",
            id: 6
          },
          referMsg: {
            type: "DownMsg",
            id: 7
          },
          toUserIds: {
            rule: "repeated",
            type: "string",
            id: 8
          },
          mergedMsgs: {
            type: "MergedMsgs",
            id: 9
          }
        }
      },
      MentionInfo: {
        fields: {
          mentionType: {
            type: "MentionType",
            id: 1
          },
          targetUsers: {
            rule: "repeated",
            type: "UserInfo",
            id: 2
          }
        }
      },
      MentionType: {
        values: {
          MentionDefault: 0,
          MentionAll: 1,
          MentionSomeone: 2
        }
      },
      DownMsg: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          type: {
            type: "ChannelType",
            id: 2
          },
          msgType: {
            type: "string",
            id: 3
          },
          senderId: {
            type: "string",
            id: 4
          },
          msgId: {
            type: "string",
            id: 5
          },
          msgIndex: {
            type: "int64",
            id: 6
          },
          msgContent: {
            type: "bytes",
            id: 7
          },
          msgTime: {
            type: "int64",
            id: 8
          },
          flags: {
            type: "int32",
            id: 9
          },
          isSend: {
            type: "bool",
            id: 10
          },
          platform: {
            type: "string",
            id: 11
          },
          clientUid: {
            type: "string",
            id: 12
          },
          pushData: {
            type: "PushData",
            id: 13
          },
          mentionInfo: {
            type: "MentionInfo",
            id: 14
          },
          isRead: {
            type: "bool",
            id: 15
          },
          referMsg: {
            type: "DownMsg",
            id: 16
          },
          targetUserInfo: {
            type: "UserInfo",
            id: 17
          },
          groupInfo: {
            type: "GroupInfo",
            id: 18
          },
          mergedMsgs: {
            type: "MergedMsgs",
            id: 19
          },
          undisturbType: {
            type: "int32",
            id: 20
          },
          memberCount: {
            type: "int32",
            id: 21
          },
          readCount: {
            type: "int32",
            id: 22
          },
          unreadIndex: {
            type: "int64",
            id: 23
          },
          msgItems: {
            rule: "repeated",
            type: "StreamMsgItem",
            id: 24
          },
          msgExtSet: {
            rule: "repeated",
            type: "MsgExtItem",
            id: 25
          },
          msgExts: {
            rule: "repeated",
            type: "MsgExtItem",
            id: 26
          },
          converTags: {
            rule: "repeated",
            type: "ConverTag",
            id: 27
          },
          searchText: {
            type: "string",
            id: 29
          },
          grpMemberInfo: {
            type: "GrpMemberInfo",
            id: 30
          }
        }
      },
      GrpMemberInfo: {
        fields: {
          grpDisplayName: {
            type: "string",
            id: 1
          },
          extFields: {
            rule: "repeated",
            type: "KvItem",
            id: 2
          },
          updatedTime: {
            type: "int64",
            id: 3
          }
        }
      },
      StreamMsgItem: {
        fields: {
          event: {
            type: "StreamEvent",
            id: 1
          },
          subSeq: {
            type: "int64",
            id: 2
          },
          partialContent: {
            type: "bytes",
            id: 3
          }
        }
      },
      StreamDownMsg: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          },
          msgItems: {
            rule: "repeated",
            type: "StreamMsgItem",
            id: 4
          }
        }
      },
      StreamEvent: {
        values: {
          DefaultStreamEvent: 0,
          StreamMessage: 1,
          StreamComplete: 2
        }
      },
      MergedMsgs: {
        fields: {
          channelType: {
            type: "ChannelType",
            id: 1
          },
          userId: {
            type: "string",
            id: 2
          },
          targetId: {
            type: "string",
            id: 3
          },
          msgs: {
            rule: "repeated",
            type: "SimpleMsg",
            id: 4
          }
        }
      },
      GroupInfo: {
        fields: {
          groupId: {
            type: "string",
            id: 1
          },
          groupName: {
            type: "string",
            id: 2
          },
          groupPortrait: {
            type: "string",
            id: 3
          },
          isMute: {
            type: "int32",
            id: 4
          },
          extFields: {
            rule: "repeated",
            type: "KvItem",
            id: 5
          },
          updatedTime: {
            type: "int64",
            id: 6
          }
        }
      },
      KvItem: {
        fields: {
          key: {
            type: "string",
            id: 1
          },
          value: {
            type: "string",
            id: 2
          }
        }
      },
      UserIdReq: {
        fields: {
          userId: {
            type: "string",
            id: 1
          }
        }
      },
      UserInfo: {
        fields: {
          userId: {
            type: "string",
            id: 1
          },
          nickname: {
            type: "string",
            id: 2
          },
          userPortrait: {
            type: "string",
            id: 3
          },
          extFields: {
            rule: "repeated",
            type: "KvItem",
            id: 4
          },
          updatedTime: {
            type: "int64",
            id: 5
          },
          settings: {
            rule: "repeated",
            type: "KvItem",
            id: 6
          },
          statuses: {
            rule: "repeated",
            type: "KvItem",
            id: 7
          },
          userType: {
            type: "UserType",
            id: 8
          }
        }
      },
      UserType: {
        values: {
          User: 0,
          Bot: 1
        }
      },
      SyncConversationsReq: {
        fields: {
          startTime: {
            type: "int64",
            id: 1
          },
          count: {
            type: "int32",
            id: 2
          }
        }
      },
      QryConversationsReq: {
        fields: {
          startTime: {
            type: "int64",
            id: 1
          },
          count: {
            type: "int32",
            id: 2
          },
          order: {
            type: "int32",
            id: 3
          },
          targetId: {
            type: "string",
            id: 5
          },
          channelType: {
            type: "ChannelType",
            id: 6
          },
          tag: {
            type: "string",
            id: 7
          }
        }
      },
      QryConversationsResp: {
        fields: {
          conversations: {
            rule: "repeated",
            type: "Conversation",
            id: 1
          },
          isFinished: {
            type: "bool",
            id: 2
          }
        }
      },
      ClearUnreadReq: {
        fields: {
          conversations: {
            rule: "repeated",
            type: "Conversation",
            id: 1
          }
        }
      },
      DelConversationReq: {
        fields: {
          conversations: {
            rule: "repeated",
            type: "Conversation",
            id: 1
          }
        }
      },
      ConversationsReq: {
        fields: {
          conversations: {
            rule: "repeated",
            type: "Conversation",
            id: 1
          }
        }
      },
      Conversation: {
        fields: {
          userId: {
            type: "string",
            id: 1
          },
          targetId: {
            type: "string",
            id: 2
          },
          channelType: {
            type: "ChannelType",
            id: 3
          },
          sortTime: {
            type: "int64",
            id: 4
          },
          unreadCount: {
            type: "int64",
            id: 5
          },
          msg: {
            type: "DownMsg",
            id: 6
          },
          latestReadIndex: {
            type: "int64",
            id: 7
          },
          mentions: {
            type: "Mentions",
            id: 8
          },
          isTop: {
            type: "int32",
            id: 9
          },
          topUpdatedTime: {
            type: "int64",
            id: 10
          },
          undisturbType: {
            type: "int32",
            id: 11
          },
          targetUserInfo: {
            type: "UserInfo",
            id: 12
          },
          groupInfo: {
            type: "GroupInfo",
            id: 13
          },
          syncTime: {
            type: "int64",
            id: 14
          },
          isDelete: {
            type: "int32",
            id: 15
          },
          latestUnreadIndex: {
            type: "int64",
            id: 16
          },
          unreadTag: {
            type: "int32",
            id: 17
          },
          latestReadMsgId: {
            type: "string",
            id: 18
          },
          latestReadMsgTime: {
            type: "int64",
            id: 19
          },
          converTags: {
            rule: "repeated",
            type: "ConverTag",
            id: 20
          }
        }
      },
      Mentions: {
        fields: {
          isMentioned: {
            type: "bool",
            id: 1
          },
          mentionMsgCount: {
            type: "int32",
            id: 2
          },
          senders: {
            rule: "repeated",
            type: "UserInfo",
            id: 3
          },
          mentionMsgs: {
            rule: "repeated",
            type: "MentionMsg",
            id: 4
          }
        }
      },
      MentionMsg: {
        fields: {
          senderId: {
            type: "string",
            id: 1
          },
          msgId: {
            type: "string",
            id: 2
          },
          msgTime: {
            type: "int64",
            id: 3
          },
          mentionType: {
            type: "MentionType",
            id: 4
          }
        }
      },
      SyncMsgReq: {
        fields: {
          syncTime: {
            type: "int64",
            id: 1
          },
          containsSendBox: {
            type: "bool",
            id: 2
          },
          sendBoxSyncTime: {
            type: "int64",
            id: 3
          },
          chatroomId: {
            type: "string",
            id: 4
          }
        }
      },
      SyncChatroomReq: {
        fields: {
          chatroomId: {
            type: "string",
            id: 1
          },
          syncTime: {
            type: "int64",
            id: 2
          },
          count: {
            type: "int32",
            id: 3
          }
        }
      },
      SyncChatroomMsgResp: {
        fields: {
          msgs: {
            rule: "repeated",
            type: "DownMsg",
            id: 1
          }
        }
      },
      Notify: {
        fields: {
          type: {
            type: "NotifyType",
            id: 1
          },
          syncTime: {
            type: "int64",
            id: 2
          },
          chatroomId: {
            type: "string",
            id: 3
          }
        }
      },
      NotifyType: {
        values: {
          Default: 0,
          Msg: 1,
          ChatroomMsg: 2,
          ChatroomAtt: 3,
          ChatroomEvent: 4,
          ChatroomDestroy: 5
        }
      },
      RecallMsgReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          },
          msgTime: {
            type: "int64",
            id: 4
          },
          exts: {
            rule: "repeated",
            type: "KvItem",
            id: 5
          }
        }
      },
      MarkReadReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgs: {
            rule: "repeated",
            type: "SimpleMsg",
            id: 3
          },
          indexScopes: {
            rule: "repeated",
            type: "IndexScope",
            id: 4
          }
        }
      },
      SimpleMsg: {
        fields: {
          msgId: {
            type: "string",
            id: 1
          },
          msgTime: {
            type: "int64",
            id: 2
          },
          msgIndex: {
            type: "int64",
            id: 3
          }
        }
      },
      IndexScope: {
        fields: {
          startIndex: {
            type: "int64",
            id: 1
          },
          endIndex: {
            type: "int64",
            id: 2
          }
        }
      },
      ModifyMsgReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          },
          msgTime: {
            type: "int64",
            id: 4
          },
          msgSeqNo: {
            type: "int64",
            id: 5
          },
          msgContent: {
            type: "bytes",
            id: 6
          }
        }
      },
      CleanHisMsgReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          cleanMsgTime: {
            type: "int64",
            id: 3
          }
        }
      },
      QryHisMsgByIdsReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgIds: {
            rule: "repeated",
            type: "string",
            id: 3
          }
        }
      },
      ChatRoomReq: {
        fields: {
          chatId: {
            type: "string",
            id: 1
          },
          chatName: {
            type: "string",
            id: 2
          },
          isAutoCreate: {
            type: "bool",
            id: 3
          }
        }
      },
      QryTotalUnreadCountReq: {
        fields: {
          time: {
            type: "int64",
            id: 1
          },
          filter: {
            type: "ConverFilter",
            id: 2
          }
        }
      },
      ConverFilter: {
        fields: {
          channelTypes: {
            rule: "repeated",
            type: "ChannelType",
            id: 1
          },
          ignoreConvers: {
            rule: "repeated",
            type: "SimpleConversation",
            id: 2
          },
          tag: {
            type: "string",
            id: 4
          }
        }
      },
      SimpleConversation: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          }
        }
      },
      QryTotalUnreadCountResp: {
        fields: {
          totalCount: {
            type: "int64",
            id: 1
          }
        }
      },
      QryMentionMsgsReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          startIndex: {
            type: "int64",
            id: 3
          },
          count: {
            type: "int32",
            id: 4
          },
          order: {
            type: "int32",
            id: 5
          },
          latestReadIndex: {
            type: "int64",
            id: 6
          }
        }
      },
      QryMentionMsgsResp: {
        fields: {
          mentionMsgs: {
            rule: "repeated",
            type: "DownMsg",
            id: 1
          },
          isFinished: {
            type: "bool",
            id: 2
          }
        }
      },
      QMentionMsg: {
        fields: {
          mentionType: {
            type: "MentionType",
            id: 1
          },
          senderInfo: {
            type: "UserInfo",
            id: 2
          },
          msg: {
            type: "DownMsg",
            id: 3
          }
        }
      },
      QryUploadTokenResp: {
        oneofs: {
          ossOf: {
            oneof: ["qiniuCred", "preSignResp"]
          }
        },
        fields: {
          ossType: {
            type: "OssType",
            id: 1
          },
          qiniuCred: {
            type: "QiniuCredResp",
            id: 11
          },
          preSignResp: {
            type: "PreSignResp",
            id: 12
          }
        }
      },
      PreSignResp: {
        fields: {
          url: {
            type: "string",
            id: 1
          },
          objKey: {
            type: "string",
            id: 2
          },
          policy: {
            type: "string",
            id: 3
          },
          signVersion: {
            type: "string",
            id: 4
          },
          credential: {
            type: "string",
            id: 5
          },
          date: {
            type: "string",
            id: 6
          },
          signature: {
            type: "string",
            id: 7
          }
        }
      },
      OssType: {
        values: {
          DefaultOss: 0,
          QiNiu: 1,
          S3: 2,
          Minio: 3,
          Oss: 4
        }
      },
      QiniuCredResp: {
        fields: {
          domain: {
            type: "string",
            id: 1
          },
          token: {
            type: "string",
            id: 2
          }
        }
      },
      QryUploadTokenReq: {
        fields: {
          fileType: {
            type: "FileType",
            id: 1
          },
          ext: {
            type: "string",
            id: 2
          }
        }
      },
      FileType: {
        values: {
          DefaultFileType: 0,
          Image: 1,
          Audio: 2,
          Video: 3,
          File: 4
        }
      },
      QryReadDetailReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          }
        }
      },
      QryReadDetailResp: {
        fields: {
          readCount: {
            type: "int32",
            id: 1
          },
          memberCount: {
            type: "int32",
            id: 2
          },
          readMembers: {
            rule: "repeated",
            type: "MemberReadDetailItem",
            id: 3
          },
          unreadMembers: {
            rule: "repeated",
            type: "MemberReadDetailItem",
            id: 4
          }
        }
      },
      MemberReadDetailItem: {
        fields: {
          member: {
            type: "UserInfo",
            id: 1
          },
          time: {
            type: "int64",
            id: 2
          }
        }
      },
      QryMergedMsgsReq: {
        fields: {
          startTime: {
            type: "int64",
            id: 1
          },
          count: {
            type: "int32",
            id: 2
          },
          order: {
            type: "int32",
            id: 3
          }
        }
      },
      UndisturbConversReq: {
        fields: {
          userId: {
            type: "string",
            id: 1
          },
          items: {
            rule: "repeated",
            type: "UndisturbConverItem",
            id: 2
          }
        }
      },
      UndisturbConverItem: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          undisturbType: {
            type: "int32",
            id: 3
          }
        }
      },
      QryTopConversReq: {
        fields: {
          startTime: {
            type: "int64",
            id: 1
          },
          sortType: {
            type: "TopConverSortType",
            id: 2
          },
          order: {
            type: "int32",
            id: 3
          }
        }
      },
      TopConverSortType: {
        values: {
          ByTopTime: 0,
          BySortTime: 1
        }
      },
      DelHisMsgsReq: {
        fields: {
          senderId: {
            type: "string",
            id: 1
          },
          targetId: {
            type: "string",
            id: 2
          },
          channelType: {
            type: "ChannelType",
            id: 3
          },
          msgs: {
            rule: "repeated",
            type: "SimpleMsg",
            id: 4
          }
        }
      },
      QryConverReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          }
        }
      },
      SyncChatroomAttResp: {
        fields: {
          atts: {
            rule: "repeated",
            type: "ChatAttItem",
            id: 1
          }
        }
      },
      ChatAtts: {
        fields: {
          chatId: {
            type: "string",
            id: 1
          },
          atts: {
            rule: "repeated",
            type: "ChatAttItem",
            id: 2
          },
          isComplete: {
            type: "bool",
            id: 3
          },
          isFinished: {
            type: "bool",
            id: 4
          }
        }
      },
      ChatAttItem: {
        fields: {
          key: {
            type: "string",
            id: 1
          },
          value: {
            type: "string",
            id: 2
          },
          attTime: {
            type: "int64",
            id: 3
          },
          userId: {
            type: "string",
            id: 4
          },
          optType: {
            type: "ChatAttOptType",
            id: 5
          }
        }
      },
      ChatAttOptType: {
        values: {
          ChatAttOpt_Default: 0,
          ChatAttOpt_Add: 1,
          ChatAttOpt_Del: 2
        }
      },
      UserUndisturb: {
        fields: {
          "switch": {
            type: "bool",
            id: 1
          },
          timezone: {
            type: "string",
            id: 2
          },
          rules: {
            rule: "repeated",
            type: "UserUndisturbItem",
            id: 3
          }
        }
      },
      UserUndisturbItem: {
        fields: {
          start: {
            type: "string",
            id: 1
          },
          end: {
            type: "string",
            id: 2
          }
        }
      },
      Nil: {
        fields: {}
      },
      ChatAttBatchReq: {
        fields: {
          atts: {
            rule: "repeated",
            type: "ChatAttReq",
            id: 1
          }
        }
      },
      ChatAttBatchResp: {
        fields: {
          attResps: {
            rule: "repeated",
            type: "ChatAttResp",
            id: 1
          }
        }
      },
      ChatAttReq: {
        fields: {
          key: {
            type: "string",
            id: 1
          },
          value: {
            type: "string",
            id: 2
          },
          isForce: {
            type: "bool",
            id: 3
          },
          isAutoDel: {
            type: "bool",
            id: 4
          },
          msg: {
            type: "UpMsg",
            id: 5
          }
        }
      },
      ChatAttResp: {
        fields: {
          key: {
            type: "string",
            id: 1
          },
          code: {
            type: "int32",
            id: 2
          },
          attTime: {
            type: "int64",
            id: 3
          },
          msgCode: {
            type: "int32",
            id: 11
          },
          msgId: {
            type: "string",
            id: 12
          },
          msgTime: {
            type: "int64",
            id: 13
          },
          msgSeq: {
            type: "int64",
            id: 14
          }
        }
      },
      QryFirstUnreadMsgReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          }
        }
      },
      ChrmEvent: {
        fields: {
          eventType: {
            type: "ChrmEventType",
            id: 1
          },
          chatId: {
            type: "string",
            id: 2
          },
          userId: {
            type: "string",
            id: 3
          },
          eventTime: {
            type: "int64",
            id: 4
          }
        }
      },
      ChrmEventType: {
        values: {
          Join: 0,
          Quit: 1,
          Kick: 2,
          Fallout: 3
        }
      },
      MsgExt: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          },
          ext: {
            type: "MsgExtItem",
            id: 4
          }
        }
      },
      MsgExtItem: {
        fields: {
          key: {
            type: "string",
            id: 1
          },
          value: {
            type: "string",
            id: 2
          },
          timestamp: {
            type: "int64",
            id: 3
          },
          userInfo: {
            type: "UserInfo",
            id: 4
          }
        }
      },
      TagConvers: {
        fields: {
          tag: {
            type: "string",
            id: 1
          },
          tagName: {
            type: "string",
            id: 2
          },
          convers: {
            rule: "repeated",
            type: "SimpleConversation",
            id: 11
          }
        }
      },
      UserConverTags: {
        fields: {
          tags: {
            rule: "repeated",
            type: "ConverTag",
            id: 1
          }
        }
      },
      ConverTag: {
        fields: {
          tag: {
            type: "string",
            id: 1
          },
          tagName: {
            type: "string",
            id: 2
          },
          tagType: {
            type: "ConverTagType",
            id: 3
          }
        }
      },
      ConverTagType: {
        values: {
          UserTag: 0,
          SystemTag: 1,
          GlobalTag: 2
        }
      },
      RtcRoomReq: {
        fields: {
          roomType: {
            type: "RtcRoomType",
            id: 1
          },
          roomId: {
            type: "string",
            id: 2
          },
          joinMember: {
            type: "RtcMember",
            id: 3
          }
        }
      },
      RtcRoomType: {
        values: {
          OneOne: 0,
          OneMore: 1
        }
      },
      RtcMember: {
        fields: {
          member: {
            type: "UserInfo",
            id: 1
          },
          rtcState: {
            type: "RtcState",
            id: 2
          },
          callTime: {
            type: "int64",
            id: 3
          },
          connectTime: {
            type: "int64",
            id: 4
          },
          hangupTime: {
            type: "int64",
            id: 5
          },
          inviter: {
            type: "UserInfo",
            id: 6
          }
        }
      },
      RtcState: {
        values: {
          RtcStateDefault: 0,
          RtcIncoming: 1,
          RtcOutgoing: 2,
          RtcConnecting: 3,
          RtcConnected: 4
        }
      },
      RtcRoom: {
        fields: {
          roomType: {
            type: "RtcRoomType",
            id: 1
          },
          roomId: {
            type: "string",
            id: 2
          },
          owner: {
            type: "UserInfo",
            id: 3
          },
          members: {
            rule: "repeated",
            type: "RtcMember",
            id: 51
          }
        }
      },
      RtcInviteReq: {
        fields: {
          targetIds: {
            rule: "repeated",
            type: "string",
            id: 1
          },
          roomType: {
            type: "RtcRoomType",
            id: 2
          },
          roomId: {
            type: "string",
            id: 3
          },
          rtcChannel: {
            type: "RtcChannel",
            id: 4
          },
          rtcMediaType: {
            type: "RtcMediaType",
            id: 5
          }
        }
      },
      RtcMediaType: {
        values: {
          RtcAudio: 0,
          RtcVideo: 1
        }
      },
      InviteType: {
        values: {
          RtcInvite: 0,
          RtcAccept: 1,
          RtcHangup: 2
        }
      },
      RtcInviteEvent: {
        fields: {
          inviteType: {
            type: "InviteType",
            id: 1
          },
          user: {
            type: "UserInfo",
            id: 2
          },
          room: {
            type: "RtcRoom",
            id: 3
          },
          targetUsers: {
            rule: "repeated",
            type: "UserInfo",
            id: 4
          }
        }
      },
      RtcAnswerReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          roomId: {
            type: "string",
            id: 2
          }
        }
      },
      RtcChannel: {
        values: {
          Zego: 0
        }
      },
      RtcAuth: {
        fields: {
          zegoAuth: {
            type: "ZegoAuth",
            id: 1
          }
        }
      },
      ZegoAuth: {
        fields: {
          token: {
            type: "string",
            id: 1
          }
        }
      },
      RtcRoomEvent: {
        fields: {
          roomEventType: {
            type: "RtcRoomEventType",
            id: 1
          },
          members: {
            rule: "repeated",
            type: "RtcMember",
            id: 2
          },
          room: {
            type: "RtcRoom",
            id: 3
          },
          reason: {
            type: "RtcRoomQuitReason",
            id: 4
          },
          eventTime: {
            type: "int64",
            id: 5
          }
        }
      },
      RtcRoomEventType: {
        values: {
          DefaultRtcRoomEvent: 0,
          RtcJoin: 1,
          RtcQuit: 2,
          RtcDestroy: 3,
          RtcStateChg: 4
        }
      },
      RtcRoomQuitReason: {
        values: {
          Active: 0,
          CallTimeout: 1,
          PingTimeout: 2
        }
      },
      TransReq: {
        fields: {
          items: {
            rule: "repeated",
            type: "TransItem",
            id: 1
          },
          targetLang: {
            type: "string",
            id: 2
          },
          sourceLang: {
            type: "string",
            id: 3
          }
        }
      },
      TransItem: {
        fields: {
          key: {
            type: "string",
            id: 1
          },
          content: {
            type: "string",
            id: 2
          }
        }
      },
      SetTopMsgReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          },
          msgId: {
            type: "string",
            id: 3
          }
        }
      },
      GetTopMsgReq: {
        fields: {
          targetId: {
            type: "string",
            id: 1
          },
          channelType: {
            type: "ChannelType",
            id: 2
          }
        }
      },
      TopMsg: {
        fields: {
          msg: {
            type: "DownMsg",
            id: 1
          },
          operator: {
            type: "UserInfo",
            id: 2
          },
          createdTime: {
            type: "int64",
            id: 3
          }
        }
      },
      FavoriteMsgIds: {
        fields: {
          items: {
            rule: "repeated",
            type: "FavoriteMsgIdItem",
            id: 1
          }
        }
      },
      FavoriteMsgIdItem: {
        fields: {
          senderId: {
            type: "string",
            id: 1
          },
          receiverId: {
            type: "string",
            id: 2
          },
          channelType: {
            type: "ChannelType",
            id: 3
          },
          msgId: {
            type: "string",
            id: 4
          }
        }
      },
      QryFavoriteMsgsReq: {
        fields: {
          limit: {
            type: "int64",
            id: 1
          },
          offset: {
            type: "string",
            id: 2
          }
        }
      },
      FavoriteMsgs: {
        fields: {
          items: {
            rule: "repeated",
            type: "FavoriteMsg",
            id: 1
          },
          offset: {
            type: "string",
            id: 2
          }
        }
      },
      FavoriteMsg: {
        fields: {
          msg: {
            type: "DownMsg",
            id: 1
          },
          createdTime: {
            type: "int64",
            id: 2
          }
        }
      }
    }
  }
});

function WebRequest () {
  let noop = () => {};
  let forEach = (obj, callback) => {
    for (var key in obj) {
      callback(obj[key], key, obj);
    }
  };
  let request = (url, option, callback) => {
    option = option || {};
    callback = callback || {
      success: noop,
      fail: noop,
      progress: noop
    };
    let xhr = new XMLHttpRequest();
    let method = option.method || 'GET';
    xhr.open(method, url, true);
    let headers = option.headers || {};
    forEach(headers, (header, name) => {
      xhr.setRequestHeader(name, header);
    });
    let body = option.body || {};
    let isSuccess = () => {
      return /^(200|202)$/.test(xhr.status);
    };
    let timeout = option.timeout;
    if (timeout) {
      xhr.timeout = timeout;
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        let {
          responseText
        } = xhr;
        responseText = responseText || '{}';
        let result = JSON.parse(responseText);
        if (isSuccess()) {
          callback.success(result, xhr);
        } else {
          let {
            status
          } = xhr;
          let error = {
            status,
            result
          };
          callback.fail(error);
        }
      }
    };
    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        callback.progress(event);
      }
    };
    xhr.onerror = error => {
      callback.fail(error);
    };
    xhr.send(body);
    return xhr;
  };
  return {
    requestNormal: request,
    uploadFile: request
  };
}

function WebEncoder () {
  let encoder = str => {
    return new TextEncoder().encode(str);
  };
  let decoder = buffer => {
    return new TextDecoder().decode(buffer);
  };
  return {
    encoder,
    decoder
  };
}

function UniEncoder () {
  let encoder = str => {
    var binstr = unescape(encodeURIComponent(str)),
      arr = new Uint8Array(binstr.length);
    binstr.split('').forEach(function (char, i) {
      arr[i] = char.charCodeAt(0);
    });
    return arr;
  };
  let decoder = view => {
    var arr = new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
      charArr = new Array(arr.length);
    arr.forEach(function (charcode, i) {
      charArr[i] = String.fromCharCode(charcode);
    });
    return decodeURIComponent(escape(charArr.join('')));
  };
  return {
    encoder,
    decoder
  };
}

let JTextEncoder = {};
if (typeof uni != "undefined") {
  JTextEncoder = UniEncoder();
} else {
  JTextEncoder = WebEncoder();
}
var JTextEncoder$1 = JTextEncoder;

function UniRequest () {
  let noop = () => {};
  let requestNormal = (url, option, callback) => {
    option = option || {};
    callback = callback || {
      success: noop,
      fail: noop,
      progress: noop
    };
    let headers = option.headers || {};
    let body = option.body || {};
    let requestTask = uni.request({
      url: url,
      data: body,
      header: headers,
      method: option.method || 'GET',
      success: res => {
        let {
          data
        } = res;
        callback.success(data, {
          responseURL: url
        });
      },
      fail: error => {
        callback.fail(error);
      }
    });
    return requestTask;
  };

  // url: 'https://jugglechat-file.oss-cn-beijing.aliyuncs.com',
  //   filePath: tempPath,
  //   header: header,
  //   name: 'file',
  //   formData: {
  //     policy: '',
  //     Key: '8osQo0sDA38bvZZFmnUri8.png',
  //     Expires: '1737617884',
  //     OSSAccessKeyId: 'LTAI5tCtWtVhvRJ741YN2PKW',
  //     Signature: 'NKVdKWn+RGT9gQjhAXyl/xtEcr0='
  //   },

  function getProtocolAndDomain(url) {
    const protocolIndex = url.indexOf("://");
    if (protocolIndex === -1) {
      return null;
    }
    const protocol = url.slice(0, protocolIndex + 3);
    const remainingUrl = url.slice(protocolIndex + 3);
    const pathIndex = remainingUrl.indexOf("/");
    const domain = pathIndex === -1 ? remainingUrl : remainingUrl.slice(0, pathIndex);
    return protocol + domain;
  }
  let uploadFile = (url, option, callbacks) => {
    let {
      tempPath,
      header,
      method,
      isUniWebThumbnail
    } = option;
    if (isUniWebThumbnail) {
      let webUploader = WebRequest();
      return webUploader.uploadFile(url, option, callbacks);
    }
    let {
      objKey,
      policy,
      signVersion,
      signature,
      date,
      credential
    } = option;
    let formData = {
      key: objKey,
      policy: policy,
      'x-oss-signature-version': signVersion,
      'x-oss-credential': credential,
      'x-oss-date': date,
      'x-oss-signature': signature
    };
    let host = getProtocolAndDomain(url);
    let uploadTask = uni.uploadFile({
      url: host,
      filePath: tempPath,
      header: header,
      name: 'file',
      formData: formData,
      success: () => {
        let fileUrl = `${host}/${objKey}`;
        callbacks.success({
          url: fileUrl
        });
      },
      fail: error => {
        callbacks.fail(error);
      }
    });
    uploadTask.onProgressUpdate(res => {
      let {
        totalBytesSent: loaded,
        totalBytesExpectedToSend: total
      } = res;
      callbacks.progress({
        loaded,
        total
      });
    });
  };
  return {
    requestNormal,
    uploadFile: uploadFile
  };
}

let JRequest = {};
if (typeof uni != "undefined") {
  JRequest = UniRequest();
} else {
  JRequest = WebRequest();
}
var jrequest = JRequest;

function Uploder (uploader, {
  type
}) {
  let qiniuExec = (content, option, callbacks) => {
    let {
      token,
      domain
    } = option;
    let {
      file,
      name
    } = content;
    let key = `${utils.getUUID()}.${getSuffix(file.name)}`;
    name = name || key;
    let putExtra = {
      fname: name
    };
    let observable = uploader.upload(file, key, token, putExtra);
    observable.subscribe({
      next: res => {
        let {
          total: {
            percent
          }
        } = res;
        callbacks.onprogress({
          percent
        });
      },
      error: error => {
        callbacks.onerror(error);
      },
      complete: res => {
        let {
          key
        } = res;
        let url = `${domain}/${key}?attname=${name}`;
        callbacks.oncompleted({
          url
        });
      }
    });
    function getSuffix(name) {
      let names = name.split('.');
      return names[names.length - 1];
    }
  };
  let aliExec = (content, option, callbacks) => {
    let {
      url
    } = option;
    let {
      file,
      name,
      tempPath
    } = content;
    jrequest.uploadFile(url, {
      ...option,
      method: 'PUT',
      headers: {
        'Content-Type': ''
      },
      tempPath: tempPath,
      body: file
    }, {
      success: result => {
        url = result.url || url.split('?')[0];
        callbacks.oncompleted({
          url
        });
      },
      progress: event => {
        let percent = event.loaded / event.total * 100;
        callbacks.onprogress({
          percent
        });
      },
      fail: error => {
        callbacks.onerror(error);
      }
    });
  };
  let s3Exec = (content, option, callbacks) => {
    let {
      url
    } = option;
    let {
      file,
      name,
      tempPath
    } = content;
    jrequest.uploadFile(url, {
      ...option,
      method: 'PUT',
      headers: {
        'Content-Type': '',
        'x-amz-acl': 'public-read'
      },
      tempPath: tempPath,
      body: file
    }, {
      success: () => {
        url = url.split('?')[0];
        callbacks.oncompleted({
          url
        });
      },
      progress: event => {
        let percent = event.loaded / event.total * 100;
        callbacks.onprogress({
          percent
        });
      },
      fail: error => {
        callbacks.onerror(error);
      }
    });
  };
  let exec = (content, option, callbacks) => {
    if (utils.isEqual(type, UPLOAD_TYPE.QINIU)) {
      return qiniuExec(content, option, callbacks);
    }
    if (utils.isEqual(type, UPLOAD_TYPE.ALI)) {
      return aliExec(content, option, callbacks);
    }
    if (utils.isEqual(type, UPLOAD_TYPE.S3)) {
      return s3Exec(content, option, callbacks);
    }
    // ... other upload plugin
  };

  /* 视频截取首帧 */
  let capture = (file, callback, option = {}) => {
    let {
      scale = 0.4
    } = option;
    let video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.preload = 'auto';
    video.onloadeddata = function () {
      captureImage();
    };
    var captureImage = function () {
      var canvas = document.createElement("canvas");
      let height = video.videoHeight;
      let width = video.videoWidth;
      let duration = video.duration;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        var frame = new File([blob], 'frame.png', {
          type: 'image/png'
        });
        let args = {
          height,
          width,
          duration
        };
        callback(frame, args);
      });
    };
  };

  /* 图片压缩缩略图 */
  let compress = (file, callback, option = {}) => {
    let {
      scale = 0.4,
      fileCompressLimit = 500
    } = option;
    let size = file.size / 1000;
    let img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function () {
      compressImage();
    };
    var compressImage = function () {
      var canvas = document.createElement("canvas");
      let height = img.height;
      let width = img.width;
      if (size <= fileCompressLimit) {
        scale = 1;
      }
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        var thumbnail = new File([blob], 'tb.png', {
          type: 'image/png'
        });
        callback(thumbnail, {
          height,
          width,
          type: 'image/png'
        });
      });
    };
  };
  return {
    exec,
    capture,
    compress
  };
}

function WebSession () {
  return sessionStorage;
}

function UniSession () {
  let result = {};
  let removeItem = key => {
    delete result[key];
  };
  let getItem = key => {
    return result[key];
  };
  let setItem = (key, value) => {
    result[key] = value;
  };
  return {
    removeItem,
    getItem,
    setItem
  };
}

let JSession = {};
if (typeof uni != "undefined") {
  JSession = UniSession();
} else {
  JSession = WebSession();
}
var JSessionStorage = JSession;

/* 
let params = { content: 123 }
let params = { content: { name: 123 } }
let params = [{ content: 123 }]
let props = [
  {
    name: 'content',
    type: 'Object',
  }
]
*/
let check = (io, _params, props, isStatic, option = {}) => {
  if (!isStatic) {
    if (!io.isConnected()) {
      return ErrorType.CONNECTION_NOT_READY;
    }
  }
  let {
    isChild,
    isArray
  } = option;
  _params = _params || {};
  let checkType = (val, type, name) => {
    let error = null;
    let {
      msg,
      code
    } = ErrorType.ILLEGAL_TYPE_PARAMS;
    let _type = Object.prototype.toString.call(val);
    _type = _type.slice(8, _type.length - 1);
    if (!utils.isEqual(_type, type)) {
      msg = `${name} ${msg}, 传入 ${_type}, 应传: ${type}`;
      error = {
        msg,
        code
      };
    }
    return error;
  };
  let checkEmpty = (val, type, name) => {
    let error = null;
    let {
      msg,
      code
    } = ErrorType.ILLEGAL_PARAMS_EMPTY;
    if (utils.isEmpty(val)) {
      msg = `${name} ${msg}`;
      error = {
        msg,
        code
      };
    }
    return error;
  };
  let checkRequire = (val, name, index) => {
    let error = null;
    let {
      msg,
      code
    } = ErrorType.ILLEGAL_PARAMS;
    if (utils.isUndefined(val)) {
      msg = `${name} ${msg}`;
      if (!isChild && utils.isArray(_params)) {
        msg = `Array index ${index} : ${msg}`;
      }
      if (isChild && isArray) {
        msg = `${option.name}[${option.num}].${msg}`;
      }
      if (isChild && !isArray) {
        msg = `${option.name}.${msg}`;
      }
      error = {
        msg,
        code
      };
    }
    return error;
  };
  let _check = (prop, param, index) => {
    let {
      name,
      type,
      children
    } = prop;
    let val = param[name];
    let error = null;
    error = checkRequire(val, name, index);
    if (error) {
      return error;
    }
    if (type) {
      error = checkType(val, type, name);
      if (!error) {
        error = checkEmpty(val, type, name);
      }
      if (!error && !utils.isUndefined(children)) {
        let isArray = utils.isEqual(type, 'Array');
        error = check(io, val, children, isStatic, {
          num: index,
          name: name,
          isChild: true,
          isArray
        });
      }
    }
    return error;
  };
  let params = utils.isArray(_params) ? _params : [_params];
  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
    for (let j = 0; j < params.length; j++) {
      let param = params[j];
      let error = _check(prop, param, j);
      if (error) {
        return error;
      }
    }
  }
};
let getNaviStorageKey = () => {
  return `${STORAGE.NAVI}`;
};
let orderNum = 0;
let getNum = () => {
  orderNum += 1;
  if (orderNum > 65535) {
    orderNum = 1;
  }
  return orderNum;
};
function updateSyncTime(message) {
  let {
    isSender,
    sentTime,
    io
  } = message;
  let key = STORAGE.SYNC_RECEIVED_MSG_TIME;
  if (isSender) {
    key = STORAGE.SYNC_SENT_MSG_TIME;
  }
  let time = Storage.get(key).time || 0;
  let isNewMsg = sentTime > time;
  if (isNewMsg) {
    Storage.set(key, {
      time: sentTime
    });
    let config = io.getConfig();
    if (config.isPC) {
      let times = {};
      times[key] = sentTime;
      config.$socket.updateSyncTime(times);
    }
  }
  return isNewMsg;
}

// PC 端打开数据库后，将本地时间戳同步至 localStorage 中
function initSyncTime(params) {
  let {
    appkey,
    userId,
    times
  } = params;
  Storage.setPrefix(`${appkey}_${userId}`);
  utils.forEach(times, (localTime, key) => {
    if (utils.isInclude([STORAGE.SYNC_RECEIVED_MSG_TIME, STORAGE.SYNC_SENT_MSG_TIME, STORAGE.SYNC_CONVERSATION_TIME], key)) {
      let item = Storage.get(key);
      let time = item.time || 0;
      if (localTime > time) {
        Storage.set(key, {
          time: localTime
        });
      }
    }
  });
}
function getError(code) {
  let error = ErrorMessages.find(error => error.code == code) || {
    code,
    msg: ''
  };
  let {
    msg
  } = error;
  return {
    code,
    msg
  };
}

// 内置消息类型和动态注入的自定消息类型
let _MSG_FLAG_NAMES = [{
  name: MESSAGE_TYPE.TEXT,
  isCount: true,
  isStorage: true
}, {
  name: MESSAGE_TYPE.STREAM_TEXT,
  isCount: true,
  isStorage: true
}, {
  name: MESSAGE_TYPE.FILE,
  isCount: true,
  isStorage: true
}, {
  name: MESSAGE_TYPE.IMAGE,
  isCount: true,
  isStorage: true
}, {
  name: MESSAGE_TYPE.VOICE,
  isCount: true,
  isStorage: true
}, {
  name: MESSAGE_TYPE.VIDEO,
  isCount: true,
  isStorage: true
}, {
  name: MESSAGE_TYPE.MERGE,
  isCount: true,
  isStorage: true,
  isMerge: true
}, {
  name: MESSAGE_TYPE.RECALL,
  isCommand: true
}, {
  name: MESSAGE_TYPE.RECALL_INFO,
  isCommand: true
}, {
  name: MESSAGE_TYPE.READ_MSG,
  isCommand: true
}, {
  name: MESSAGE_TYPE.READ_GROUP_MSG,
  isCommand: true
}, {
  name: MESSAGE_TYPE.MODIFY,
  isCommand: true
}, {
  name: MESSAGE_TYPE.CLEAR_MSG,
  isCommand: true
}, {
  name: MESSAGE_TYPE.CLEAR_UNREAD,
  isCommand: true,
  isCount: false,
  isStorage: false
}];
let formatter = {
  toFlag: ({
    isCommand,
    isCount,
    isStorage,
    isMerge,
    isMass
  }) => {
    let flag = 0;
    isCommand && (flag |= 1 << 0);
    isCount && (flag |= 1 << 1);
    isStorage && (flag |= 1 << 3);
    isMerge && (flag |= 1 << 5);
    isMass && (flag |= 1 << 7);
    return flag;
  },
  toMsg: flag => {
    let obj = {
      1: {
        name: 'isCommand'
      },
      2: {
        name: 'isCount'
      },
      3: {
        name: 'isStatus'
      },
      4: {
        name: 'isStorage'
      },
      5: {
        name: 'isUpdated'
      },
      6: {
        name: 'isMerge'
      },
      7: {
        name: 'isMute'
      },
      8: {
        name: 'isMass'
      },
      11: {
        name: 'isStream'
      }
    };
    let result = {};
    for (let num in obj) {
      // 创建一个只有第 N 位为 1 其他都为 0 的掩码
      let bitMask = Math.pow(2, num - 1);
      let name = obj[num].name;
      result[name] = (flag & bitMask) !== 0;
    }
    return result;
  }
};
let registerMessage = names => {
  names = utils.isArray(names) ? names : [names];
  utils.forEach(names, name => {
    _MSG_FLAG_NAMES.push(name);
  });
};
let getMsgFlag = (name, option = {}) => {
  let msg = utils.filter(_MSG_FLAG_NAMES, n => {
    return utils.isEqual(n.name, name);
  })[0] || {};
  let _msg = {
    ...msg,
    ...option
  };
  let flag = formatter.toFlag(_msg);
  return flag;
};
function ConversationUtils() {
  let conversations = [];
  let isSynced = false;
  let isExisted = item => {
    let index = utils.find(conversations, ({
      conversationType,
      conversationId
    }) => {
      return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
    });
    return index > -1;
  };
  let update = list => {
    list = utils.isArray(list) ? list : [list];
    utils.forEach(list, item => {
      let index = utils.find(conversations, ({
        conversationType,
        conversationId
      }) => {
        return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
      });
      let conversation = item;
      let {
        latestMessage,
        updatedTime,
        conversationExts,
        mentions,
        undisturbType
      } = item;
      let tags = latestMessage.tags;
      let messageName = latestMessage.name;
      let msgFlag = formatter.toMsg(latestMessage.flags) || {};
      let _isSender = latestMessage.isSender;
      let isSender = utils.isBoolean(_isSender) && _isSender;
      if (!utils.isEqual(index, -1)) {
        conversation = conversations.splice(index, 1)[0];
        let {
          conversationTitle,
          conversationPortrait
        } = latestMessage;
        conversationTitle = conversationTitle || item.conversationTitle;
        conversationPortrait = conversationPortrait || item.conversationPortrait;
        if (utils.isEmpty(conversationTitle)) {
          conversationTitle = conversation.conversationTitle;
        }
        if (utils.isEmpty(conversationPortrait)) {
          conversationPortrait = conversation.conversationPortrait;
        }
        if (utils.isEmpty(conversationExts)) {
          conversationExts = conversation.conversationExts;
        }
        if (utils.isEqual(latestMessage.name, MESSAGE_TYPE.CLEAR_MSG) && latestMessage.isSender) {
          latestMessage = {};
        }
        conversation = utils.extend(conversation, {
          latestMessage: latestMessage,
          conversationTitle,
          conversationPortrait,
          conversationExts,
          mentions,
          updatedTime,
          undisturbType
        });
      }
      let {
        unreadCount = 0,
        latestReadIndex = 0,
        latestUnreadIndex = 0
      } = conversation;
      // 自己发送的多端同步清空消息，未读数设置为 0，最后一条消息保持不变
      if (utils.isEqual(messageName, MESSAGE_TYPE.CLEAR_UNREAD) && latestMessage.isSender) {
        unreadCount = 0;
        latestMessage = conversation.latestMessage;
      }
      if (!isSender && msgFlag.isCount) {
        latestUnreadIndex = latestMessage.unreadIndex || latestUnreadIndex;
        unreadCount = latestUnreadIndex - latestReadIndex;
      }
      if (unreadCount < 0 || utils.isNull(unreadCount)) {
        unreadCount = 0;
      }
      let key = getDraftKey(conversation);
      let draft = Storage.get(key);
      draft = utils.isEmpty(draft) ? '' : draft;
      utils.extend(conversation, {
        draft
      });
      if (!utils.isEmpty(tags)) {
        utils.extend(conversation, {
          tags
        });
      }
      let sortTime = latestMessage.sentTime || conversation.sortTime;
      // 如果是自己发发送的群发消息不更新会话列表, 自己本地发送的消息通过 isMass 区分，接收或同步消息通过消息位计算
      if (latestMessage.isMass && isSender) {
        sortTime = conversation.sortTime;
      }
      conversation = utils.extend(conversation, {
        sortTime,
        unreadCount,
        latestUnreadIndex,
        latestReadIndex
      });
      conversations.push(conversation);
    });
    conversations = utils.quickSort(conversations, (a, b) => {
      return a.sortTime > b.sortTime;
    });
    let MAX_COUNT = 1000;
    if (conversations.length > MAX_COUNT) {
      conversations.length = MAX_COUNT;
    }
  };
  let setSynced = () => {
    isSynced = true;
  };
  let add = list => {
    update(list);
  };
  let remove = item => {
    let _conver = item;
    let index = utils.find(conversations, ({
      conversationType,
      conversationId,
      latestMessage = {}
    }) => {
      let isMatched = true;
      // 删除会话指令中包含 time，用来判断是否是过期的删除指令
      if (item.time > 0) {
        isMatched = item.time >= latestMessage.sentTime;
      }
      return isMatched && utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
    });
    if (!utils.isEqual(index, -1)) {
      let arrs = conversations.splice(index, 1);
      _conver = arrs[0];
    }
    return _conver;
  };
  let clear = () => {
    isSynced = false;
    conversations.length = 0;
  };
  let relpace = conversation => {
    let index = utils.find(conversations, ({
      conversationType,
      conversationId
    }) => {
      return utils.isEqual(conversation.conversationType, conversationType) && utils.isEqual(conversation.conversationId, conversationId);
    });
    if (!utils.isEqual(index, -1)) {
      utils.extend(conversations[index], conversation);
    }
    return conversations[index] || {};
  };
  let modify = (_conversations, props = {}) => {
    let list = [];
    _conversations = utils.isArray(_conversations) ? _conversations : [_conversations];
    utils.forEach(_conversations, item => {
      let conversation = getPer(item);
      if (!utils.isEmpty(conversation)) {
        utils.extend(conversation, props);
        if (utils.isEmpty(props)) {
          utils.extend(conversation, item);
        }
        let conver = relpace(conversation);
        list.push(conver);
      } else {
        list.push(item);
      }
    });
    return list;
  };
  let get = () => {
    return conversations;
  };
  let getPer = conversation => {
    let index = utils.find(conversations, ({
      conversationType,
      conversationId
    }) => {
      return utils.isEqual(conversation.conversationType, conversationType) && utils.isEqual(conversation.conversationId, conversationId);
    });
    return conversations[index] || {};
  };
  let isSync = () => {
    return isSynced;
  };
  let read = list => {
    list = utils.isArray(list) ? list : [list];
    let _list = [];
    utils.forEach(list, item => {
      let index = utils.find(conversations, ({
        conversationType,
        conversationId
      }) => {
        return utils.isEqual(item.conversationType, conversationType) && utils.isEqual(item.conversationId, conversationId);
      });
      if (index > -1) {
        conversations[index].latestReadIndex = item.unreadIndex;
        conversations[index].unreadCount = 0;
        conversations[index].mentions = {};
        conversations[index].unreadTag = UNREAD_TAG.READ;
        _list.push(conversations[index]);
      }
    });
    return _list;
  };
  return {
    remove,
    update,
    clear,
    get,
    isSync,
    add,
    relpace,
    setSynced,
    modify,
    getPer,
    read,
    isExisted
  };
}

// 特性检查
function checkUploadType(upload) {
  upload = upload || {};
  let type = UPLOAD_TYPE.NONE;
  if (upload.QiniuError) {
    type = UPLOAD_TYPE.QINIU;
  }
  if (upload.urllib) {
    type = UPLOAD_TYPE.ALI;
  }
  if (upload && upload.name == 'S3Client') {
    type = UPLOAD_TYPE.S3;
  }
  return type;
}
function formatMediaMessage(message, url) {
  let {
    name,
    content
  } = message;
  if (utils.isEqual(name, MESSAGE_TYPE.FILE)) {
    let {
      file
    } = content;
    let size = file.size / 1000;
    utils.extend(message.content, {
      size,
      url
    });
  }
  if (utils.isEqual(name, MESSAGE_TYPE.IMAGE)) {
    let {
      height,
      width
    } = content;
    let direction = 'h';
    if (width > height) {
      direction = 'w';
    }
    let thumbnail = `${url}&imageView2/2/${direction}/100`;
    utils.extend(message.content, {
      url,
      thumbnail
    });
  }
  if (utils.isInclude([MESSAGE_TYPE.VIDEO, MESSAGE_TYPE.VOICE], name)) {
    utils.extend(message.content, {
      url
    });
  }
  return message;
}
function uploadThumbnail(upload, option, callback) {
  if (typeof uni != 'undefined' && uni.compressImage) {
    return uploadUniThumbnail(upload, option, callback);
  }
  uploadWebThumbnail(upload, option, callback);
}
function uploadUniThumbnail(upload, option, callback) {
  let {
    type,
    content
  } = option;
  let uploader = Uploder(upload, {
    type
  });
  let {
    tempPath
  } = content;
  uni.compressImage({
    src: tempPath,
    quality: 25,
    success: res => {
      let callbacks = {
        onprogress: utils.noop,
        oncompleted: ({
          url
        }) => {
          let error = null;
          uni.getImageInfo({
            src: tempPath,
            success: function (args) {
              callback(error, url, args);
            }
          });
        },
        onerror: error => {
          callback(error);
        }
      };
      uploader.exec({
        tempPath: res.tempFilePath
      }, option, callbacks);
    }
  });
}
function uploadWebThumbnail(upload, option, callback) {
  let {
    type,
    token,
    domain,
    file,
    url: uploadUrl
  } = option;
  let uploader = Uploder(upload, {
    type
  });
  uploader.compress(file, (tbFile, args) => {
    let content = {
      file: tbFile
    };
    let opts = {
      token,
      domain,
      url: uploadUrl,
      ...option,
      isUniWebThumbnail: true
    };
    let callbacks = {
      onprogress: utils.noop,
      oncompleted: ({
        url
      }) => {
        let error = null;
        callback(error, url, {
          ...args,
          isUniWebThumbnail: true
        });
      },
      onerror: error => {
        callback(error);
      }
    };
    uploader.exec(content, opts, callbacks);
  }, option);
}
function uploadFrame(upload, option, callback) {
  if (isUni()) {
    return uploadUniFrame(upload, option, callback);
  }
  uploadWebFrame(upload, option, callback);
}

//TODO: UniApp 截图视频首帧需特殊处理
function uploadUniFrame(upload, option, callback) {
  let error = null;
  let url = '';
  callback(error, url, option.content);
}
function uploadWebFrame(upload, option, callback) {
  let {
    type,
    token,
    domain,
    file,
    url: uploadUrl
  } = option;
  let uploader = Uploder(upload, {
    type
  });
  uploader.capture(file, (frameFile, args) => {
    let content = {
      file: frameFile
    };
    let opts = {
      token,
      domain,
      url: uploadUrl,
      ...option
    };
    let callbacks = {
      onprogress: utils.noop,
      oncompleted: ({
        url
      }) => {
        let error = null;
        callback(error, url, args);
      },
      onerror: error => {
        callback(error);
      }
    };
    uploader.exec(content, opts, callbacks);
  }, option);
}
function getDraftKey(item) {
  return `draft_${item.conversationType}_${item.conversationId}`;
}
function formatUser(user) {
  let exts = utils.toObject(user.extFields);
  return {
    id: user.userId,
    name: user.nickname || "",
    portrait: user.userPortrait || "",
    updatedTime: user.updatedTime || 0,
    exts: exts || {},
    type: user.userType || 0
  };
}
function formatGroupMember(member) {
  if (!member) {
    member = {
      extFields: []
    };
  }
  let exts = utils.toObject(member.extFields);
  return {
    name: member.grpDisplayName || "",
    updatedTime: member.updatedTime || 0,
    exts: exts || {}
  };
}
function toKVs(obj) {
  let arrs = [];
  utils.forEach(obj, (value, key) => {
    arrs.push({
      key,
      value
    });
  });
  return arrs;
}
function formatProvider(funcs, instance) {
  let invokes = {};
  utils.forEach(funcs, name => {
    invokes[name] = function () {
      let args = [];
      for (let i = 0; i < arguments.length; i++) {
        let item = arguments[i],
          itemNew = {};
        itemNew = utils.isArray(item) ? item : clone(item);
        args.push(itemNew);
      }
      let func = instance[name];
      if (func) {
        return func(...args);
      }
      return Promise.reject(ErrorType.SDK_FUNC_NOT_DEFINED);
    };
  });
  return invokes;
}
function clone(item) {
  let loop = obj => {
    let newObj = {};
    utils.forEach(obj, (v, k) => {
      // 递归循环中包含 File 对象直接跳过，File 对象不能 clone
      if (utils.isObject(v)) {
        newObj[k] = loop(v);
      } else if (utils.isArray(v)) {
        newObj[k] = utils.clone(v);
      } else {
        newObj[k] = v;
      }
    });
    return newObj;
  };
  let result = loop(item);
  return result;
}
function isDesktop() {
  return typeof JGChatPCClient != 'undefined';
}
function getSessionId() {
  return 's-xxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
function getTokenKey(appkey, token) {
  return `${appkey}_${token}`;
}
function genUId() {
  return 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
function getClientSession() {
  let clientSession = JSessionStorage.getItem(STORAGE.CLIENT_SESSION);
  if (!clientSession) {
    clientSession = genUId();
    JSessionStorage.setItem(STORAGE.CLIENT_SESSION, clientSession);
  }
  return clientSession;
}
function encrypto(arrs, xors) {
  let list = [];
  arrs.forEach((v, index) => {
    let i = index % 8;
    let _v = v ^ xors[i];
    list.push(_v);
  });
  return new Uint8Array(list);
}
function decrypto(arrs, xors) {
  let list = [];
  arrs.forEach((v, index) => {
    let i = index % 8;
    let _v = v ^ xors[i];
    list.push(_v);
  });
  return new Uint8Array(list);
}
function reportLogs({
  logger,
  params
}) {
  return logger.report({
    ...params
  });
}
function isUni() {
  return typeof uni != 'undefined';
}
var common = {
  check,
  getNum,
  getTokenKey,
  getNaviStorageKey,
  initSyncTime,
  updateSyncTime,
  getError,
  ConversationUtils,
  checkUploadType,
  formatMediaMessage,
  uploadThumbnail,
  uploadFrame,
  getDraftKey,
  formatUser,
  toKVs,
  registerMessage,
  getMsgFlag,
  formatter,
  formatProvider,
  isDesktop,
  getSessionId,
  getClientSession,
  encrypto,
  decrypto,
  reportLogs,
  isUni,
  formatGroupMember
};

function getConnectBody ({
  data
}) {
  let {
    appkey,
    token,
    deviceId,
    platform,
    clientSession,
    sdkVersion
  } = data;
  let protoId = 'jug9le1m';
  let codec = $root.lookup('codec.ConnectMsgBody');
  let message = codec.create({
    appkey,
    token,
    platform,
    deviceId,
    clientSession,
    protoId,
    sdkVersion
  });
  let buffer = codec.encode(message).finish();
  return {
    buffer
  };
}

function getPublishBody ({
  data,
  callback,
  index
}) {
  let {
    conversationId: targetId,
    conversationType,
    topic
  } = data;
  let buffer = [];
  if (utils.isInclude([COMMAND_TOPICS.SEND_GROUP, COMMAND_TOPICS.SEND_PRIVATE, COMMAND_TOPICS.SEND_CHATROOM], topic)) {
    let {
      name,
      content,
      mentionInfo,
      flag,
      mergeMsg,
      referMsg,
      push,
      clientMsgId
    } = data;
    content = utils.toJSON(content);
    let codec = $root.lookup('codec.UpMsg');
    let mention = {};
    if (mentionInfo) {
      let {
        members = [],
        mentionType
      } = mentionInfo;
      members = utils.map(members, member => {
        return {
          userId: member.id
        };
      });
      utils.extend(mention, {
        mentionType: mentionType,
        targetUsers: members
      });
    }
    if (!utils.isEmpty(referMsg)) {
      let {
        messageIndex,
        sentTime,
        messageId,
        sender = {
          exts: {}
        }
      } = referMsg;
      let referContent = utils.toJSON(referMsg.content);
      // let referTarget = {
      //   userId: sender.id,
      //   nickname: sender.name,
      //   userPortrait: sender.portrait,
      //   extFields: common.toKVs(sender.exts)
      // };
      referMsg = {
        msgIndex: messageIndex,
        msgTime: sentTime,
        msgId: messageId,
        msgContent: JTextEncoder$1.encoder(referContent),
        msgType: referMsg.name,
        type: referMsg.conversationType,
        senderId: sender.id
        // targetUserInfo: referTarget
      };
    }

    let _msg = {
      msgType: name,
      mentionInfo: mention,
      flags: flag,
      referMsg: referMsg,
      mergedMsgs: mergeMsg,
      clientUid: clientMsgId,
      msgContent: JTextEncoder$1.encoder(content)
    };
    if (push) {
      let {
        text,
        title
      } = push;
      let pushData = {
        title,
        pushText: text
      };
      pushData = utils.clone(pushData);
      if (!utils.isEmpty(pushData)) {
        _msg = utils.extend(_msg, {
          pushData
        });
      }
    }
    let message = codec.create(_msg);
    buffer = codec.encode(message).finish();
  }
  let codec = $root.lookup('codec.PublishMsgBody');
  let message = codec.create({
    index,
    targetId,
    topic,
    data: buffer
  });
  let _buffer = codec.encode(message).finish();
  return {
    buffer: _buffer
  };
}

function getPublishAckBody ({
  data
}) {
  let {
    msgIndex,
    ackIndex
  } = data;
  let codec = $root.lookup('codec.PublishAckMsgBody');
  let message = codec.create({
    index: ackIndex,
    msgIndex,
    code: 0
  });
  let buffer = codec.encode(message).finish();
  return {
    buffer
  };
}

function getQueryBody({
  data,
  callback,
  index
}) {
  let {
    targetId,
    userId,
    topic
  } = data;
  let buffer = [];
  if (utils.isEqual(topic, COMMAND_TOPICS.HISTORY_MESSAGES)) {
    let {
      conversationType,
      time,
      count,
      order,
      names
    } = data;
    let codec = $root.lookup('codec.QryHisMsgsReq');
    let message = codec.create({
      converId: targetId,
      type: conversationType,
      startTime: time,
      count: count,
      order: order,
      msgTypes: names
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.CONVERSATIONS)) {
    let {
      count,
      time,
      order,
      conversationType,
      tag
    } = data;
    targetId = userId;
    let codec = $root.lookup('codec.QryConversationsReq');
    let content = {
      startTime: time,
      count: count,
      order: order
    };
    if (!utils.isUndefined(conversationType)) {
      utils.extend(content, {
        channelType: conversationType
      });
    }
    if (tag) {
      utils.extend(content, {
        tag
      });
    }
    let message = codec.create(content);
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_CONVERSATION, topic)) {
    let {
      conversation,
      userId
    } = data;
    let {
      conversationId,
      conversationType
    } = conversation;
    let codec = $root.lookup('codec.QryConverReq');
    let message = codec.create({
      channelType: conversationType,
      targetId: conversationId
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.SYNC_CONVERSATIONS, topic)) {
    let {
      count,
      syncTime
    } = data;
    targetId = userId;
    let codec = $root.lookup('codec.SyncConversationsReq');
    let message = codec.create({
      startTime: syncTime,
      count
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.SYNC_MESSAGES)) {
    let {
      syncTime,
      containsSendBox,
      sendBoxSyncTime
    } = data;
    targetId = userId;
    let codec = $root.lookup('codec.SyncMsgReq');
    let message = codec.create({
      syncTime,
      containsSendBox,
      sendBoxSyncTime
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.SYNC_CHATROOM_MESSAGES)) {
    let {
      syncTime,
      chatroomId,
      count
    } = data;
    let codec = $root.lookup('codec.SyncChatroomReq');
    let message = codec.create({
      syncTime,
      chatroomId,
      count
    });
    targetId = chatroomId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.SYNC_CHATROOM_ATTRS)) {
    let {
      syncTime,
      chatroomId
    } = data;
    let codec = $root.lookup('codec.SyncChatroomReq');
    let message = codec.create({
      syncTime,
      chatroomId
    });
    targetId = chatroomId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_MSG_BY_IDS, topic)) {
    let {
      conversationId,
      conversationType: channelType,
      messageIds: msgIds,
      userId
    } = data;
    let codec = $root.lookup('codec.QryHisMsgByIdsReq');
    let message = codec.create({
      channelType,
      targetId: conversationId,
      msgIds
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_UNREAD_TOTLAL_CONVERSATION, topic)) {
    targetId = userId;
    let codec = $root.lookup('codec.QryTotalUnreadCountReq');
    let {
      conversationTypes = [],
      ignoreConversations = [],
      tag
    } = data;
    let ingores = [];
    utils.forEach(ignoreConversations, ({
      conversationId,
      conversationType
    }) => {
      ingores.push({
        targetId: conversationId,
        channelType: conversationType
      });
    });
    let filter = {
      channelTypes: conversationTypes,
      ignoreConvers: ingores
    };
    if (tag) {
      utils.extend(filter, {
        tag
      });
    }
    let message = codec.create({
      filter: filter
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.CLEAR_UNREAD_TOTLAL_CONVERSATION, topic)) {
    targetId = userId;
    let codec = $root.lookup('codec.QryTotalUnreadCountReq');
    let message = codec.create({});
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.READ_MESSAGE, topic)) {
    let {
      messages
    } = data;
    messages = utils.isArray(messages) ? messages : [messages];
    let channelType = CONVERATION_TYPE.PRIVATE;
    let channelId = '';
    let msgs = utils.map(messages, item => {
      let {
        conversationType,
        conversationId,
        sentTime,
        messageId,
        unreadIndex
      } = item;
      channelType = conversationType;
      channelId = conversationId;
      targetId = conversationId;
      return {
        msgId: messageId,
        msgTime: sentTime,
        msgIndex: unreadIndex
      };
    });
    let codec = $root.lookup('codec.MarkReadReq');
    let message = codec.create({
      channelType,
      targetId: channelId,
      msgs
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_READ_MESSAGE_DETAIL, topic)) {
    let {
      message
    } = data;
    let {
      conversationType: channelType,
      conversationId,
      messageId: msgId
    } = message;
    let codec = $root.lookup('codec.QryReadDetailReq');
    let msg = codec.create({
      channelType,
      targetId: conversationId,
      msgId
    });
    targetId = msgId;
    buffer = codec.encode(msg).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_MENTION_MSGS, topic)) {
    let {
      conversationId,
      conversationType: channelType,
      count,
      order,
      messageIndex: startIndex,
      userId
    } = data;
    let codec = $root.lookup('codec.QryMentionMsgsReq');
    let message = codec.create({
      targetId: conversationId,
      channelType,
      count,
      order,
      startIndex
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_FILE_TOKEN, topic)) {
    targetId = userId;
    let {
      type,
      ext
    } = data;
    let codec = $root.lookup('codec.QryUploadTokenReq');
    let message = codec.create({
      fileType: type,
      ext
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_USER_INFO, topic)) {
    targetId = userId;
    let codec = $root.lookup('codec.UserIdReq');
    let message = codec.create({
      userId
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_MERGE_MSGS, topic)) {
    let {
      messageId,
      time,
      count,
      order
    } = data;
    targetId = messageId;
    let codec = $root.lookup('codec.QryMergedMsgsReq');
    let message = codec.create({
      startTime: time,
      count,
      order
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_FIRST_UNREAD_MSG, topic)) {
    let {
      conversationType,
      conversationId
    } = data;
    targetId = conversationId;
    let codec = $root.lookup('codec.QryFirstUnreadMsgReq');
    let message = codec.create({
      channelType: conversationType,
      targetId: conversationId
    });
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.QUERY_TOP_CONVERSATIONS, topic)) {
    let {
      time,
      userId,
      sortType
    } = data;
    let codec = $root.lookup('codec.QryTopConversReq');
    let message = codec.create({
      startTime: time,
      sortType
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.RECALL, topic)) {
    let {
      messageId,
      sentTime,
      exts,
      conversationType,
      conversationId
    } = data;
    let _exts = [];
    utils.forEach(exts, (value, key) => {
      _exts.push({
        key,
        value
      });
    });
    let codec = $root.lookup('codec.RecallMsgReq');
    let message = codec.create({
      targetId: conversationId,
      channelType: conversationType,
      msgId: messageId,
      msgTime: sentTime,
      exts: _exts
    });
    targetId = conversationId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.CLEAR_UNREAD, topic)) {
    let {
      conversations,
      userId
    } = data;
    conversations = utils.isArray(conversations) ? conversations : [conversations];
    let codec = $root.lookup('codec.ClearUnreadReq');
    let list = utils.map(conversations, ({
      conversationType,
      conversationId,
      unreadIndex
    }) => {
      return {
        channelType: conversationType,
        targetId: conversationId,
        latestReadIndex: unreadIndex
      };
    });
    let message = codec.create({
      conversations: list
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.SET_ALL_DISTURB, topic)) {
    let {
      userId,
      times,
      timezone,
      type
    } = data;
    let codec = $root.lookup('codec.UserUndisturb');
    let isSwitch = utils.isEqual(UNDISTURB_TYPE.DISTURB, type);
    let message = codec.create({
      switch: isSwitch,
      timezone: timezone,
      rules: times
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_ALL_DISTURB, topic)) {
    let {
      userId
    } = data;
    let codec = $root.lookup('codec.Nil');
    let message = codec.create({});
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.MARK_CONVERSATION_UNREAD, topic)) {
    let {
      userId,
      conversations
    } = data;
    conversations = utils.map(conversations, item => {
      let {
        conversationId,
        conversationType,
        unreadTag
      } = item;
      return {
        channelType: conversationType,
        targetId: conversationId,
        unreadTag
      };
    });
    let codec = $root.lookup('codec.ConversationsReq');
    let message = codec.create({
      conversations
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.SET_CHATROOM_ATTRIBUTES, COMMAND_TOPICS.REMOVE_CHATROOM_ATTRIBUTES], topic)) {
    let {
      chatroom: {
        id: chatId,
        attributes,
        options
      }
    } = data;
    let {
      notify
    } = options;
    let codec = $root.lookup('codec.ChatAttBatchReq');
    let _msg = {
      atts: attributes
    };
    if (!utils.isUndefined(notify)) {
      utils.extend(_msg, {
        msg: JTextEncoder$1.encoder(notify)
      });
    }
    let message = codec.create(_msg);
    targetId = chatId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.REMOVE_CONVERSATION, topic)) {
    let {
      conversations,
      userId
    } = data;
    conversations = utils.isArray(conversations) ? conversations : [conversations];
    let list = utils.map(conversations, ({
      conversationType,
      conversationId
    }) => {
      return {
        channelType: conversationType,
        targetId: conversationId
      };
    });
    let codec = $root.lookup('codec.DelConversationReq');
    let message = codec.create({
      conversations: list
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.UPDATE_MESSAGE, topic)) {
    let {
      conversationId,
      conversationType: channelType,
      messageId: msgId,
      content,
      sentTime: msgTime
    } = data;
    let codec = $root.lookup('codec.ModifyMsgReq');
    content = utils.toJSON(content);
    let message = codec.create({
      channelType,
      targetId: conversationId,
      msgId,
      msgTime,
      msgContent: JTextEncoder$1.encoder(content)
    });
    targetId = conversationId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.CLEAR_MESSAGE, topic)) {
    let {
      conversationId,
      conversationType: channelType,
      time: cleanMsgTime
    } = data;
    let codec = $root.lookup('codec.CleanHisMsgReq');
    let message = codec.create({
      channelType,
      targetId: conversationId,
      cleanMsgTime
    });
    targetId = conversationId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.JOIN_CHATROOM, topic)) {
    let {
      chatroom: {
        id: chatId,
        isAutoCreate
      }
    } = data;
    let codec = $root.lookup('codec.ChatRoomReq');
    let message = codec.create({
      chatId,
      isAutoCreate
    });
    targetId = chatId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.QUIT_CHATROOM, topic)) {
    let {
      chatroom: {
        id: chatId
      }
    } = data;
    let codec = $root.lookup('codec.ChatRoomReq');
    let message = codec.create({
      chatId
    });
    targetId = chatId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.INSERT_CONVERSATION, topic)) {
    let {
      conversation,
      userId
    } = data;
    let {
      conversationId,
      conversationType
    } = conversation;
    let codec = $root.lookup('codec.Conversation');
    let message = codec.create({
      channelType: conversationType,
      targetId: conversationId
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.MUTE_CONVERSATION, topic)) {
    let {
      userId,
      conversations
    } = data;
    let items = utils.isArray(conversations) ? conversations : [conversations];
    items = utils.map(items, item => {
      let {
        conversationType,
        conversationId,
        undisturbType
      } = item;
      return {
        targetId: conversationId,
        channelType: conversationType,
        undisturbType
      };
    });
    let codec = $root.lookup('codec.UndisturbConversReq');
    let message = codec.create({
      userId: userId,
      items: items
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.TOP_CONVERSATION, topic)) {
    let {
      userId,
      conversations
    } = data;
    let items = utils.isArray(conversations) ? conversations : [conversations];
    items = utils.map(items, item => {
      let {
        conversationType,
        conversationId,
        isTop
      } = item;
      return {
        targetId: conversationId,
        channelType: conversationType,
        isTop
      };
    });
    let codec = $root.lookup('codec.ConversationsReq');
    let message = codec.create({
      conversations: items
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.REMOVE_MESSAGE, topic)) {
    let {
      userId,
      messages
    } = data;
    let msgs = [],
      _targetId = '',
      channelType = CONVERATION_TYPE.PRIVATE;
    utils.forEach(messages, message => {
      let {
        conversationType,
        conversationId,
        messageIndex,
        sentTime,
        messageId
      } = message;
      _targetId = conversationId;
      channelType = conversationType, msgs.push({
        msgId: messageId,
        msgIndex: messageIndex,
        msgTime: sentTime
      });
    });
    let codec = $root.lookup('codec.DelHisMsgsReq');
    let message = codec.create({
      channelType,
      targetId: _targetId,
      msgs: msgs
    });
    targetId = _targetId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.ADD_MSG_REACTION, COMMAND_TOPICS.REMOVE_MSG_REACTION], topic)) {
    let {
      messageId,
      reactionId,
      userId,
      conversationId,
      conversationType
    } = data;
    let codec = $root.lookup('codec.MsgExt');
    let message = codec.create({
      channelType: conversationType,
      targetId: conversationId,
      msgId: messageId,
      ext: {
        key: reactionId,
        value: userId
      }
    });
    targetId = messageId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.CONVERSATION_TAG_ADD, COMMAND_TOPICS.CONVERSATION_TAG_REMOVE], topic)) {
    let {
      userId,
      tag
    } = data;
    let {
      name = '',
      id,
      conversations = []
    } = tag;
    let convers = utils.map(conversations, ({
      conversationId,
      conversationType
    }) => {
      return {
        targetId: conversationId,
        channelType: conversationType
      };
    });
    let codec = $root.lookup('codec.TagConvers');
    let message = codec.create({
      tag: id,
      tagName: name,
      convers: convers
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.TAG_REMOVE, topic)) {
    let {
      userId,
      tag
    } = data;
    let tags = utils.isArray(tag) ? tag : [tag];
    tags = utils.map(tags, tag => {
      return {
        tag: tag.id
      };
    });
    let codec = $root.lookup('codec.UserConverTags');
    let message = codec.create({
      tags: tags
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.CONVERSATION_TAG_QUERY, topic)) {
    let {
      userId
    } = data;
    let codec = $root.lookup('codec.Nil');
    let message = codec.create({});
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.RTC_CREATE_ROOM, COMMAND_TOPICS.RTC_JOIN_ROOM], topic)) {
    let {
      room,
      user
    } = data;
    let {
      id,
      type,
      option = {}
    } = room;
    let {
      cameraEnable = false,
      micEnable = false
    } = option;
    let codec = $root.lookup('codec.RtcRoomReq');
    let message = codec.create({
      roomId: id,
      roomType: type,
      joinMember: {
        member: user,
        rtcState: RTC_STATE.NONE,
        cameraEnable,
        micEnable
      }
    });
    targetId = user.id;
    if (utils.isEqual(COMMAND_TOPICS.RTC_JOIN_ROOM, topic)) {
      targetId = room.id;
    }
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.RTC_QUIT_ROOM, topic)) {
    let {
      room
    } = data;
    let codec = $root.lookup('codec.RtcRoomReq');
    let message = codec.create({
      roomId: room.id,
      roomType: room.type
    });
    targetId = room.id;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.RTC_QRY_ROOM, topic)) {
    let {
      room
    } = data;
    let codec = $root.lookup('codec.Nil');
    let message = codec.create({});
    targetId = room.id;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.RTC_PING, topic)) {
    let {
      room
    } = data;
    let codec = $root.lookup('codec.Nil');
    let message = codec.create({});
    targetId = room.id;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.RTC_INVITE, topic)) {
    let {
      roomId,
      roomType,
      memberIds,
      channel,
      user,
      mediaType
    } = data;
    let codec = $root.lookup('codec.RtcInviteReq');
    let message = codec.create({
      roomId: roomId,
      roomType: roomType,
      targetIds: memberIds,
      rtcChannel: channel,
      rtcMediaType: mediaType
    });
    targetId = roomId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.RTC_UPDATE_STATE, topic)) {
    let {
      memberId,
      state,
      roomId
    } = data;
    let codec = $root.lookup('codec.RtcMember');
    let message = codec.create({
      member: {
        userId: memberId
      },
      rtcState: state
    });
    targetId = roomId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.RTC_ACCEPT, COMMAND_TOPICS.RTC_HANGUP], topic)) {
    let {
      roomId,
      user
    } = data;
    let codec = $root.lookup('codec.Nil');
    let message = codec.create({});
    targetId = roomId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.SET_TOP_MSG, COMMAND_TOPICS.DEL_TOP_MSG], topic)) {
    let {
      conversationId,
      conversationType,
      messageId,
      isTop,
      userId
    } = data;
    let codec = $root.lookup('codec.SetTopMsgReq');
    let message = codec.create({
      channelType: conversationType,
      targetId: conversationId,
      msgId: messageId
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.GET_TOP_MSG, topic)) {
    let {
      conversationId,
      conversationType
    } = data;
    let codec = $root.lookup('codec.GetTopMsgReq');
    let message = codec.create({
      channelType: conversationType,
      targetId: conversationId
    });
    targetId = conversationId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isInclude([COMMAND_TOPICS.MSG_ADD_FAVORITE, COMMAND_TOPICS.MSG_REMOVE_FAVORITE], topic)) {
    let {
      messages,
      userId
    } = data;
    let codec = $root.lookup('codec.FavoriteMsgIds');
    let items = utils.map(messages, message => {
      let {
        conversationId,
        conversationType,
        senderId,
        messageId
      } = message;
      return {
        channelType: conversationType,
        receiverId: conversationId,
        senderId: senderId,
        msgId: messageId
      };
    });
    let message = codec.create({
      items
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.MSG_QRY_FAVORITE, topic)) {
    let {
      limit,
      offset,
      userId
    } = data;
    let codec = $root.lookup('codec.QryFavoriteMsgsReq');
    let message = codec.create({
      limit,
      offset
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  if (utils.isEqual(COMMAND_TOPICS.BATCH_TRANSLATE, topic)) {
    let {
      userId,
      content,
      sourceLang,
      targetLang
    } = data;
    let codec = $root.lookup('codec.TransReq');
    let items = [];
    utils.forEach(content, (val, key) => {
      items.push({
        key,
        content: val
      });
    });
    sourceLang = utils.isEqual(sourceLang, 'auto') ? '' : sourceLang;
    let message = codec.create({
      items,
      sourceLang,
      targetLang
    });
    targetId = userId;
    buffer = codec.encode(message).finish();
  }
  let codec = $root.lookup('codec.QueryMsgBody');
  let message = codec.create({
    index,
    topic,
    targetId,
    data: buffer
  });
  let _buffer = codec.encode(message).finish();
  return {
    buffer: _buffer
  };
}

function getPingBody() {
  return {};
}

function Encoder(cache) {
  let imsocket = $root.lookup('codec.ImWebsocketMsg');
  let encode = (cmd, data) => {
    let body = {},
      memory = {};
    let payload = {
      version: 1,
      cmd: cmd,
      qos: QOS.YES
    };
    let {
      counter,
      callback,
      index
    } = data;
    switch (cmd) {
      case SIGNAL_CMD.CONNECT:
        body = getConnectBody(data);
        memory = {
          counter
        };
        break;
      case SIGNAL_CMD.PUBLISH:
        body = getPublishBody(data);
        memory = {
          callback,
          data: data.data,
          counter
        };
        break;
      case SIGNAL_CMD.PUBLISH_ACK:
        body = getPublishAckBody(data);
        memory = {
          callback,
          data: data.data,
          counter
        };
        break;
      case SIGNAL_CMD.QUERY:
        body = getQueryBody(data);
        let {
          targetId,
          userId,
          topic
        } = data.data;
        memory = {
          callback,
          index,
          topic,
          targetId,
          counter
        };
        break;
      case SIGNAL_CMD.PING:
        body = getPingBody();
        memory = {
          counter
        };
        break;
    }
    cache.set(index, memory);
    if (body.buffer) {
      let xors = cache.get(STORAGE.CRYPTO_RANDOM);
      let _buffer = common.encrypto(body.buffer, xors);
      utils.extend(payload, {
        payload: _buffer
      });
    }
    let message = imsocket.create(payload);
    let buffer = imsocket.encode(message).finish();
    return buffer;
  };
  return {
    encode
  };
}

function InfoCacher () {
  let cache = Cache();
  let set = (id, info = {}) => {
    let _info = cache.get(id);
    if (utils.isEmpty(_info)) {
      _info = {
        updatedTime: 0
      };
    }
    if (info.updatedTime > _info.updatedTime) {
      cache.set(id, info);
    }
  };
  let get = id => {
    let _info = cache.get(id) || {};
    return _info;
  };
  let clear = () => {
    cache.clear();
  };
  return {
    set,
    get,
    clear
  };
}

let $groupCacher = InfoCacher();
var GroupCacher = {
  ...$groupCacher
};

let $userCacher = InfoCacher();
var UserCacher = {
  ...$userCacher
};

function msgFormat(msg, {
  currentUser
}) {
  let {
    msgItems,
    converTags,
    undisturbType,
    msgExtSet,
    senderId,
    unreadIndex,
    memberCount,
    referMsg,
    readCount,
    msgId,
    msgTime,
    msgType,
    msgContent,
    type: conversationType,
    targetId: conversationId,
    mentionInfo,
    isSend,
    msgIndex,
    isRead,
    flags,
    targetUserInfo,
    groupInfo,
    grpMemberInfo
  } = msg;
  let content = '';
  if (msgContent && msgContent.length > 0) {
    content = JTextEncoder$1.decoder(msgContent);
    content = utils.parse(content);
  }

  // 服务端返回数据有 targetUserInfo 和 groupInfo 为 null 情况，此处补充 targetId，方便本地有缓存时获取信息
  targetUserInfo = targetUserInfo || {
    userId: senderId
  };
  groupInfo = groupInfo || {
    groupId: conversationId
  };

  // 默认更新内存数据
  let userId = targetUserInfo.userId;
  let groupId = groupInfo.groupId;
  GroupCacher.set(groupId, groupInfo);
  UserCacher.set(userId, targetUserInfo);
  let targetUser = common.formatUser(targetUserInfo);

  // 特性检查，如果没有 name 尝试从内存获取信息
  if (utils.isUndefined(targetUser.name)) {
    let _user = UserCacher.get(userId);
    targetUser = utils.isEmpty(_user) ? {
      id: userId
    } : _user;
  }
  if (utils.isUndefined(groupInfo.groupName)) {
    let _group = GroupCacher.get(groupId);
    groupInfo = utils.isEmpty(_group) ? {
      id: groupId
    } : _group;
  }
  if (mentionInfo) {
    let {
      targetUsers,
      mentionType
    } = mentionInfo;
    let members = utils.map(targetUsers, user => {
      user = common.formatUser(user);
      return user;
    });
    mentionInfo = {
      mentionType,
      members
    };
  }
  let newRefer = {};
  if (referMsg) {
    let rcontent = referMsg.msgContent || '';
    if (rcontent.length != 0) {
      rcontent = JTextEncoder$1.decoder(rcontent);
      newRefer.content = utils.parse(rcontent);
    }
    referMsg.targetUserInfo = common.formatUser(referMsg.targetUserInfo || {});
    utils.extend(newRefer, {
      name: referMsg.msgType,
      messageId: referMsg.messageIndex,
      messageIndex: referMsg.msgIndex,
      sentTime: referMsg.msgTime,
      sender: referMsg.targetUserInfo
    });
  }
  let msgFlag = common.formatter.toMsg(flags);
  let user = currentUser;
  let reactions = {};
  if (msgExtSet) {
    msgExtSet = utils.map(msgExtSet, item => {
      let {
        key,
        value,
        timestamp,
        userInfo
      } = item;
      let user = common.formatUser(userInfo);
      return {
        key,
        value,
        user,
        timestamp
      };
    });
    reactions = utils.groupBy(msgExtSet, ['key']);
  }
  converTags = converTags || [];
  let tags = utils.map(converTags, item => {
    let {
      tag: id,
      tagName: name,
      tagType: type
    } = item;
    return {
      id,
      name,
      type
    };
  });
  let groupMember = {};
  if (utils.isEqual(CONVERATION_TYPE.GROUP, conversationType)) {
    groupMember = common.formatGroupMember(grpMemberInfo);
  }
  let _message = {
    conversationType,
    conversationId,
    conversationTitle: '',
    conversationPortrait: '',
    conversationExts: {},
    sender: utils.clone(targetUser),
    groupMember: groupMember,
    messageId: msgId,
    tid: msgId,
    sentTime: msgTime,
    name: msgType,
    isSender: utils.isEqual(user.id, senderId),
    messageIndex: msgIndex,
    mentionInfo,
    isRead: !!isRead,
    isUpdated: msgFlag.isUpdated,
    isMuted: msgFlag.isMute,
    isMass: msgFlag.isMass,
    isStreamMsg: msgFlag.isStream,
    referMsg: newRefer,
    sentState: MESSAGE_SENT_STATE.SUCCESS,
    undisturbType: undisturbType || 0,
    unreadIndex: unreadIndex || 0,
    flags,
    reactions,
    tags
  };
  if (_message.isSender) {
    utils.extend(_message.sender, user);
  }
  let streams = [];
  if (_message.isStreamMsg) {
    streams = formatStreams(msgItems);
  }
  utils.extend(_message, {
    streams
  });
  if (utils.isEqual(conversationType, CONVERATION_TYPE.GROUP)) {
    let {
      groupName,
      groupPortrait,
      extFields,
      groupId,
      updatedTime
    } = groupInfo || {
      extFields: {}
    };
    extFields = utils.toObject(extFields);
    utils.extend(_message, {
      conversationTitle: groupName || '',
      conversationPortrait: groupPortrait || '',
      conversationExts: extFields,
      conversationUpdatedTime: groupInfo.updatedTime || 0,
      unreadCount: memberCount - readCount,
      readCount: readCount
    });
  }
  if (utils.isEqual(conversationType, CONVERATION_TYPE.PRIVATE)) {
    utils.extend(_message, {
      conversationTitle: targetUser.name,
      conversationPortrait: targetUser.portrait,
      conversationExts: targetUser.exts,
      conversationUpdatedTime: targetUser.updatedTime,
      conversationUserType: targetUser.userType || 0
    });
  }
  if (utils.isInclude([MESSAGE_TYPE.RECALL_INFO, MESSAGE_TYPE.RECALL], msgType)) {
    content = utils.rename(content, {
      msg_id: 'messageId',
      msg_time: 'sentTime'
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.MODIFY, msgType)) {
    content = utils.rename(content, {
      msg_type: 'name',
      msg_content: 'content',
      msg_id: 'messageId',
      msg_seq: 'messageIndex',
      msg_time: 'sentTime'
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.READ_MSG, msgType)) {
    delete content.index_scopes;
    let {
      msgs
    } = content;
    msgs = utils.map(msgs, ({
      msg_id: messageId
    }) => {
      return {
        messageId
      };
    });
    utils.extend(content, {
      msgs
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.READ_GROUP_MSG, msgType)) {
    let {
      msgs
    } = content;
    msgs = utils.map(msgs, ({
      msg_id,
      member_count,
      read_count
    }) => {
      return {
        messageId: msg_id,
        unreadCount: member_count - read_count,
        readCount: read_count
      };
    });
    utils.extend(content, {
      msgs
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.CLEAR_UNREAD, msgType)) {
    let {
      conversations
    } = content;
    conversations = utils.map(conversations, ({
      channel_type,
      target_id,
      latest_read_index
    }) => {
      return {
        conversationType: channel_type,
        conversationId: target_id,
        unreadIndex: latest_read_index
      };
    });
    utils.extend(content, {
      conversations
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_UNDISTURB, msgType)) {
    let {
      conversations
    } = content;
    conversations = utils.map(conversations, item => {
      return {
        conversationId: item.target_id,
        conversationType: item.channel_type,
        undisturbType: item.undisturb_type
      };
    });
    utils.extend(content, {
      conversations
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_TOPCONVERS, msgType)) {
    let {
      conversations
    } = content;
    conversations = utils.map(conversations, item => {
      return {
        conversationId: item.target_id,
        conversationType: item.channel_type,
        isTop: Boolean(item.is_top)
      };
    });
    utils.extend(content, {
      conversations
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_REMOVE_CONVERS, msgType)) {
    let {
      conversations
    } = content;
    conversations = utils.map(conversations, item => {
      return {
        conversationId: item.target_id,
        conversationType: item.channel_type,
        time: msg.msgTime
      };
    });
    utils.extend(content, {
      conversations
    });
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_DELETE_MSGS, msgType)) {
    let msgs = utils.map(content.msgs, item => {
      return {
        tid: item.msg_id,
        messageId: item.msg_id,
        conversationId: msg.targetId,
        conversationType: content.channel_type
      };
    });
    content = {
      conversationId: msg.targetId,
      conversationType: content.channel_type,
      messages: msgs
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.CLEAR_MSG, msgType)) {
    content = {
      cleanTime: content.clean_time,
      conversationType: content.channel_type,
      conversationId: msg.targetId,
      senderId: content.sender_id
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_ADD_CONVER, msgType)) {
    let _conversation = content.conversation;
    let {
      target_id,
      channel_type,
      sort_time,
      sync_time,
      target_user_info = {}
    } = _conversation;
    let {
      nickname,
      user_portrait,
      ext_fields,
      updated_time
    } = target_user_info;
    content = {
      conversationId: target_id,
      conversationType: channel_type,
      conversationTitle: nickname,
      conversationPortrait: user_portrait,
      conversationExts: ext_fields,
      latestMessage: {
        conversationId: target_id,
        conversationType: channel_type
      },
      unreadCount: 0,
      updatedTime: updated_time,
      sortTime: sort_time,
      syncTime: sync_time
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_CLEAR_TOTALUNREAD, msgType)) {
    content = {
      clearTime: content.clear_time
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_ADD, msgType)) {
    let {
      tag,
      tag_name,
      convers
    } = content;
    convers = convers || [];
    convers = utils.map(convers, item => {
      return {
        conversationId: item.target_id,
        conversationType: item.channel_type
      };
    });
    content = {
      id: tag,
      name: tag_name,
      conversations: convers
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_REMOVE, msgType)) {
    let {
      tags
    } = content;
    tags = utils.map(tags, tag => {
      return {
        id: tag.tag
      };
    });
    content = {
      tags
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_REMOVE_CONVERS_FROM_TAG, msgType)) {
    let {
      tag: id,
      convers
    } = content;
    convers = utils.map(convers, item => {
      return {
        conversationId: item.target_id,
        conversationType: item.channel_type
      };
    });
    content = {
      id,
      conversations: convers
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_MARK_UNREAD, msgType)) {
    let list = content.conversations;
    let conversations = utils.map(list, item => {
      let {
        unread_tag,
        channel_type,
        target_id
      } = item;
      return {
        conversationId: target_id,
        conversationType: channel_type,
        unreadTag: unread_tag
      };
    });
    content = {
      conversations
    };
  }
  if (utils.isEqual(MESSAGE_TYPE.COMMAND_MSG_EXSET, msgType)) {
    let {
      channel_type,
      msg_id,
      exts
    } = content;
    let reactions = utils.map(exts, item => {
      let {
        is_del,
        timestamp,
        key,
        value,
        user
      } = item;
      key = unescape(key);
      let _user = {};
      if (user) {
        _user = {
          id: user.user_id,
          name: user.nickname,
          portrait: user.user_portrait
        };
      }
      return {
        isRemove: Boolean(is_del),
        key,
        value,
        timestamp,
        user: _user
      };
    });
    content = {
      conversationId,
      conversationType,
      messageId: msg_id,
      reactions
    };
  }
  utils.extend(_message, {
    content
  });
  return _message;
}
function formatConversations$1(conversations, options = {}) {
  return conversations.map(conversation => {
    let {
      msg,
      targetId,
      unreadCount,
      sortTime: _sortTime,
      topUpdatedTime,
      targetUserInfo,
      groupInfo,
      syncTime,
      undisturbType,
      mentions,
      channelType: conversationType,
      latestReadIndex,
      latestUnreadIndex,
      isTop,
      unreadTag,
      converTags
    } = conversation;
    if (!msg) {
      msg = {
        msgContent: []
      };
    }
    let {
      topic,
      currentUser
    } = options;
    utils.extend(msg, {
      targetId
    });
    unreadCount = unreadCount || 0;
    unreadTag = unreadTag || 0;
    mentions = mentions || {};
    if (!utils.isEmpty(mentions)) {
      let {
        isMentioned,
        senders,
        mentionMsgs
      } = mentions;
      senders = utils.map(senders, sender => {
        return common.formatUser(sender);
      });
      mentionMsgs = utils.map(mentionMsgs, msg => {
        let {
          senderId,
          msgId,
          msgTime,
          mentionType
        } = msg;
        return {
          senderId,
          messageId: msgId,
          sentTime: msgTime,
          mentionType
        };
      });
      mentions = {
        isMentioned: isMentioned,
        senders: senders,
        msgs: mentionMsgs,
        count: mentionMsgs.length
      };
    }
    let latestMessage = {};
    if (!utils.isEqual(msg.msgContent.length, 0)) {
      latestMessage = msgFormat(msg, {
        currentUser
      });
    }
    if (utils.isEqual(conversationType, CONVERATION_TYPE.GROUP)) {
      groupInfo = groupInfo || {
        extFields: {}
      };
      let {
        groupName,
        groupPortrait,
        extFields,
        groupId,
        updatedTime
      } = groupInfo;
      extFields = utils.toObject(extFields);
      utils.extend(latestMessage, {
        conversationTitle: groupName || '',
        conversationPortrait: groupPortrait || '',
        conversationExts: extFields,
        conversationUpdatedTime: updatedTime || 0
      });
      GroupCacher.set(groupId, groupInfo);
    }
    if (utils.isEqual(conversationType, CONVERATION_TYPE.PRIVATE)) {
      targetUserInfo = targetUserInfo || {
        extFields: {}
      };
      let {
        userPortrait,
        nickname,
        extFields,
        userId,
        updatedTime,
        userType
      } = targetUserInfo;
      extFields = utils.toObject(extFields);
      utils.extend(latestMessage, {
        conversationTitle: nickname || '',
        conversationPortrait: userPortrait || '',
        conversationExts: extFields,
        conversationUpdatedTime: updatedTime || 0,
        conversationUserType: userType || 0
      });
      UserCacher.set(userId, targetUserInfo);
    }
    let {
      conversationTitle,
      conversationPortrait,
      conversationExts,
      conversationUpdatedTime,
      conversationUserType
    } = latestMessage;
    if (utils.isEqual(COMMAND_TOPICS.QUERY_TOP_CONVERSATIONS, topic)) {
      _sortTime = topUpdatedTime;
    }
    converTags = converTags || [];
    let tags = utils.map(converTags, item => {
      let {
        tag: id,
        tagName: name,
        tagType: type
      } = item;
      return {
        id,
        name,
        type
      };
    });
    return {
      conversationType,
      conversationId: targetId,
      unreadCount,
      sortTime: _sortTime,
      latestMessage,
      conversationTitle,
      conversationPortrait,
      conversationUpdatedTime,
      conversationUserType,
      conversationExts,
      mentions,
      syncTime,
      undisturbType: undisturbType || 0,
      latestReadIndex,
      latestUnreadIndex,
      unreadTag,
      tags,
      isTop: !!isTop
    };
  });
}
function formatRTCRoom(result) {
  let {
    roomId,
    roomType,
    members
  } = result;
  members = utils.map(members, item => {
    let {
      member,
      rtcState: state,
      cameraEnable,
      micEnable,
      callTime,
      connectTime,
      hangupTime,
      inviter
    } = item;
    member = common.formatUser(member);
    inviter = common.formatUser(inviter);
    return {
      member,
      rtcState: state,
      cameraEnable,
      micEnable,
      callTime,
      connectTime,
      hangupTime,
      inviter
    };
  });
  return {
    room: {
      id: roomId,
      type: roomType
    },
    members: members
  };
}
function formatStreams(list) {
  let streams = utils.map(list, item => {
    return formatStream(item);
  });
  return streams;
}
function formatStream(item) {
  let {
    event,
    subSeq,
    partialContent
  } = item;
  let content = '';
  if (partialContent && partialContent.length > 0) {
    content = JTextEncoder$1.decoder(partialContent);
    content = utils.parse(content);
  }
  return {
    event,
    seq: subSeq,
    content
  };
}
var tools$1 = {
  msgFormat,
  formatConversations: formatConversations$1,
  formatRTCRoom,
  formatStreams
};

function getQueryAckBody(stream, {
  cache,
  currentUser
}) {
  let codec = $root.lookup('codec.QueryAckMsgBody');
  let qryAckMsgBody = codec.decode(stream);
  let {
    index,
    data,
    code,
    timestamp
  } = qryAckMsgBody;
  let {
    topic,
    targetId
  } = cache.get(index);
  let result = {};
  if (utils.isInclude([COMMAND_TOPICS.HISTORY_MESSAGES, COMMAND_TOPICS.SYNC_MESSAGES, COMMAND_TOPICS.GET_MSG_BY_IDS, COMMAND_TOPICS.GET_MERGE_MSGS], topic)) {
    result = getMessagesHandler(index, data, {
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.SYNC_CHATROOM_MESSAGES)) {
    result = getChatroomMsgsHandler(index, data, {
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.SYNC_CHATROOM_ATTRS)) {
    result = getChatroomAttrsHandler(index, data, {
      targetId
    });
  }
  if (utils.isInclude([COMMAND_TOPICS.CONVERSATIONS, COMMAND_TOPICS.SYNC_CONVERSATIONS, COMMAND_TOPICS.QUERY_TOP_CONVERSATIONS], topic)) {
    result = getConversationsHandler(index, data, {
      topic,
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_CONVERSATION)) {
    result = getConversationHandler(index, data, {
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_UNREAD_TOTLAL_CONVERSATION)) {
    result = getTotalUnread(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_READ_MESSAGE_DETAIL)) {
    result = getMessageReadDetails(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_MENTION_MSGS)) {
    result = getMentionMessages(index, data, {
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_FILE_TOKEN)) {
    result = getFileToken(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_USER_INFO)) {
    result = getUserInfo(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_ALL_DISTURB)) {
    result = getAllDisturb(index, data);
  }
  if (utils.isInclude([COMMAND_TOPICS.REMOVE_CHATROOM_ATTRIBUTES, COMMAND_TOPICS.SET_CHATROOM_ATTRIBUTES], topic)) {
    result = getChatroomSetAttrs(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_FIRST_UNREAD_MSG)) {
    result = getMessage(index, data, {
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.CONVERSATION_TAG_QUERY)) {
    result = getConversationTags(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.BATCH_TRANSLATE)) {
    result = getBatchTranslate(index, data);
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.GET_TOP_MSG)) {
    result = getTopMessage(index, data, {
      currentUser
    });
  }
  if (utils.isEqual(topic, COMMAND_TOPICS.MSG_QRY_FAVORITE)) {
    result = getFavtoriteMsgs(index, data, {
      currentUser
    });
  }
  if (utils.isInclude([COMMAND_TOPICS.RTC_ACCEPT, COMMAND_TOPICS.RTC_INVITE], topic)) {
    result = getRTCAuth(index, data);
  }
  if (utils.isInclude([COMMAND_TOPICS.RTC_CREATE_ROOM, COMMAND_TOPICS.RTC_JOIN_ROOM, COMMAND_TOPICS.RTC_QRY_ROOM], topic)) {
    result = getRTCRoom(index, data);
  }
  result = utils.extend(result, {
    code,
    timestamp,
    index
  });
  return result;
}
function getFavtoriteMsgs(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.FavoriteMsgs');
  let result = payload.decode(data);
  let {
    items,
    offset
  } = result;
  if (!items) {
    items = [];
  }
  let list = utils.map(items, item => {
    let {
      createdTime,
      msg
    } = item;
    let message = tools$1.msgFormat(msg, {
      currentUser
    });
    return {
      createdTime,
      message
    };
  });
  return {
    index,
    list,
    offset
  };
}
function getTopMessage(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.TopMsg');
  let result = payload.decode(data);
  let {
    msg,
    operator,
    createdTime = 0
  } = result;
  let message = {};
  if (msg) {
    message = tools$1.msgFormat(result.msg, {
      currentUser
    });
    operator = common.formatUser(result.operator);
  }
  return {
    index,
    message,
    operator,
    createdTime
  };
}
function getBatchTranslate(index, data) {
  let payload = $root.lookup('codec.TransReq');
  let trans = payload.decode(data);
  return {
    index,
    trans
  };
}
function getRTCAuth(index, data) {
  let payload = $root.lookup('codec.RtcAuth');
  let auth = payload.decode(data);
  return {
    index,
    auth
  };
}
function getChatroomSetAttrs(index, data) {
  let payload = $root.lookup('codec.ChatAttBatchResp');
  let {
    attResps
  } = payload.decode(data);
  let success = [],
    fail = [];
  utils.forEach(attResps, attr => {
    let {
      code = 0,
      key,
      attTime: updateTime,
      msgTime: messageTime
    } = attr;
    let _attr = {
      code,
      key,
      updateTime,
      messageTime
    };
    if (utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
      success.push(_attr);
    } else {
      let error = common.getError(code);
      utils.extend(_attr, error);
      fail.push(_attr);
    }
  });
  return {
    index,
    success,
    fail
  };
}
function getMentionMessages(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.QryMentionMsgsResp');
  let {
    mentionMsgs,
    isFinished
  } = payload.decode(data);
  let msgs = utils.map(mentionMsgs, msg => {
    return tools$1.msgFormat(msg, {
      currentUser
    });
  });
  return {
    index,
    msgs,
    isFinished
  };
}
function getFileToken(index, data) {
  let payload = $root.lookup('codec.QryUploadTokenResp');
  let result = payload.decode(data);
  let {
    ossType
  } = result;
  let cred = {
    type: ossType
  };
  if (utils.isEqual(ossType, UPLOAD_TYPE.QINIU)) {
    let {
      qiniuCred
    } = result;
    utils.extend(cred, qiniuCred);
  }
  if (utils.isEqual(ossType, UPLOAD_TYPE.ALI)) {
    let {
      preSignResp
    } = result;
    utils.extend(cred, preSignResp);
  }
  if (utils.isEqual(ossType, UPLOAD_TYPE.S3)) {
    let {
      preSignResp
    } = result;
    utils.extend(cred, preSignResp);
  }
  return {
    index,
    cred
  };
}
function getUserInfo(index, data) {
  let payload = $root.lookup('codec.UserInfo');
  let user = payload.decode(data);
  return {
    index,
    user
  };
}
function getAllDisturb(index, data) {
  let payload = $root.lookup('codec.UserUndisturb');
  let params = payload.decode(data);
  let {
    timezone,
    rules = []
  } = params;
  let type = params.switch ? UNDISTURB_TYPE.UNDISTURB : UNDISTURB_TYPE.DISTURB;
  let times = [];
  utils.forEach(rules, ({
    start,
    end
  }) => {
    times.push({
      start,
      end
    });
  });
  return {
    index,
    type,
    timezone,
    times
  };
}
function getMessageReadDetails(index, data) {
  let payload = $root.lookup('codec.QryReadDetailResp');
  let {
    readCount,
    memberCount,
    readMembers,
    unreadMembers
  } = payload.decode(data);
  readMembers = utils.map(readMembers, item => {
    return {
      member: common.formatUser(item.member),
      readTime: item.time
    };
  });
  unreadMembers = utils.map(unreadMembers, item => {
    return {
      member: common.formatUser(item.member),
      readTime: item.time
    };
  });
  return {
    index,
    readCount,
    unreadCount: memberCount - readCount,
    readMembers,
    unreadMembers
  };
}
function getTotalUnread(index, data) {
  let payload = $root.lookup('codec.QryTotalUnreadCountResp');
  let {
    totalCount: count
  } = payload.decode(data);
  return {
    index,
    count
  };
}
function getConversationHandler(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.Conversation');
  let item = payload.decode(data);
  let conversations = tools$1.formatConversations([item], {
    currentUser
  });
  let conversation = conversations[0] || {};
  return {
    conversation,
    index
  };
}
function getConversationsHandler(index, data, options = {}) {
  let payload = $root.lookup('codec.QryConversationsResp');
  let {
    conversations,
    isFinished
  } = payload.decode(data);
  conversations = tools$1.formatConversations(conversations, options);
  return {
    conversations,
    isFinished,
    index
  };
}
function getChatroomAttrsHandler(index, data, {
  targetId
}) {
  let payload = $root.lookup('codec.SyncChatroomAttResp');
  let result = payload.decode(data);
  let {
    atts
  } = result;
  atts = utils.map(atts, attr => {
    let {
      key,
      value,
      attTime: updateTime,
      userId,
      optType: type
    } = attr;
    return {
      key,
      value,
      updateTime,
      userId,
      type
    };
  });
  return {
    attrs: atts,
    chatroomId: targetId,
    index
  };
}
function getConversationTags(index, data) {
  let payload = $root.lookup('codec.UserConverTags');
  let result = payload.decode(data);
  let {
    tags
  } = result;
  tags = utils.map(tags, tag => {
    let {
      tag: id,
      tagName,
      tagType
    } = tag;
    return {
      id,
      name: tagName,
      type: tagType
    };
  });
  return {
    tags,
    index
  };
}
function getChatroomMsgsHandler(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.SyncChatroomMsgResp');
  let result = payload.decode(data);
  let {
    msgs
  } = result;
  let messages = utils.map(msgs, msg => {
    return tools$1.msgFormat(msg, {
      currentUser
    });
  });
  return {
    messages,
    index
  };
}
function getMessage(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.DownMsg');
  let _msg = payload.decode(data);
  if (!_msg.msgId) {
    return {
      index,
      msg: {}
    };
  }
  let msg = tools$1.msgFormat(_msg, {
    currentUser
  });
  return {
    index,
    msg
  };
}
function getMessagesHandler(index, data, {
  currentUser
}) {
  let payload = $root.lookup('codec.DownMsgSet');
  let result = payload.decode(data);
  let {
    isFinished,
    msgs,
    targetUserInfo,
    groupInfo
  } = result;
  let messages = utils.map(msgs, msg => {
    // sync_msgs 和 getHistoryMessages 共用此方法，但 sync_msgs 的用户信息携带在消息里，历史消息在 pb 结构外侧与 msgs 同级，此处做兼容处理
    if (targetUserInfo) {
      utils.extend(msg, {
        targetUserInfo
      });
    }
    if (groupInfo) {
      utils.extend(msg, {
        groupInfo
      });
    }
    return tools$1.msgFormat(msg, {
      currentUser
    });
  });
  return {
    isFinished,
    messages,
    index
  };
}
function getRTCRoom(index, data) {
  let payload = $root.lookup('codec.RtcRoom');
  let result = payload.decode(data);
  return {
    room: tools$1.formatRTCRoom(result)
  };
}

function getPublishMsgBody(stream, {
  currentUser
}) {
  let codec = $root.lookup('codec.PublishMsgBody');
  let publishMsgBody = codec.decode(stream);
  let {
    targetId,
    data,
    topic,
    timestamp,
    index
  } = publishMsgBody;
  let _msg = {};
  let _name = SIGNAL_NAME.CMD_RECEIVED;

  // 收到 NTF 直接返回，通过 sync_msgs 同步消息
  if (utils.isEqual(topic, COMMAND_TOPICS.NTF)) {
    let payload = $root.lookup('codec.Notify');
    let message = payload.decode(data);
    let {
      syncTime: receiveTime,
      type,
      chatroomId
    } = message;
    _msg = {
      topic,
      receiveTime,
      type,
      targetId: chatroomId
    };
    _name = SIGNAL_NAME.S_NTF;
  } else if (utils.isEqual(topic, COMMAND_TOPICS.MSG)) {
    let payload = $root.lookup('codec.DownMsg');
    let message = payload.decode(data);
    _msg = tools$1.msgFormat(message, {
      currentUser
    });
  } else if (utils.isEqual(topic, COMMAND_TOPICS.CHATROOM_USER_NTF)) {
    let payload = $root.lookup('codec.ChrmEvent');
    let message = payload.decode(data);
    let {
      chatId,
      eventTime,
      eventType
    } = message;
    _msg = {
      chatroomId: chatId,
      time: eventTime,
      type: eventType
    };
    _name = SIGNAL_NAME.S_CHATROOM_USER_NTF;
  } else if (utils.isEqual(topic, COMMAND_TOPICS.RTC_INVITE_EVENT)) {
    let payload = $root.lookup('codec.RtcInviteEvent');
    let result = payload.decode(data);
    let {
      room,
      inviteType,
      targetUsers = [],
      user
    } = result;
    user = common.formatUser(user || {});
    let members = utils.map(targetUsers, target => {
      return common.formatUser(target);
    });
    let {
      roomId,
      roomType,
      members: existsMembers
    } = room;
    existsMembers = existsMembers || [];
    existsMembers = utils.map(existsMembers, ({
      member,
      rtcState
    }) => {
      member = common.formatUser(member);
      utils.extend(member, {
        status: rtcState
      });
      return member;
    });
    _msg = {
      roomId,
      roomType,
      eventType: inviteType,
      user,
      members,
      existsMembers
    };
    _name = SIGNAL_NAME.S_RTC_INVITE_NTF;
  } else if (utils.isEqual(topic, COMMAND_TOPICS.RTC_ROOM_EVENT)) {
    let payload = $root.lookup('codec.RtcRoomEvent');
    let result = payload.decode(data);
    let {
      roomEventType,
      members,
      room,
      reason
    } = result;
    members = members || [];
    members = utils.map(members, ({
      member,
      rtcState
    }) => {
      member = common.formatUser(member);
      utils.extend(member, {
        status: rtcState
      });
      return member;
    });
    let {
      owner
    } = room;
    owner = common.formatUser(owner || {});
    room.owner = owner;
    _msg = {
      roomEventType,
      room,
      members,
      reason
    };
    _name = SIGNAL_NAME.S_RTC_ROOM_EVENT;
  } else if (utils.isEqual(topic, COMMAND_TOPICS.STREAM_MSG)) {
    let payload = $root.lookup('codec.StreamDownMsg');
    let result = payload.decode(data);
    let {
      channelType: conversationType,
      targetId: conversationId,
      msgId: messageId,
      msgItems
    } = result;
    let streams = tools$1.formatStreams(msgItems);
    _msg = {
      conversationId,
      conversationType,
      messageId,
      streams
    };
    _name = SIGNAL_NAME.S_STREAM_EVENT;
  } else {
    console.log('unkown topic', topic);
  }
  utils.extend(_msg, {
    ackIndex: index
  });
  return {
    _msg,
    _name
  };
}

function Decoder(cache, io) {
  let imsocket = $root.lookup('codec.ImWebsocketMsg');
  let decode = buffer => {
    let msg = imsocket.decode(new Uint8Array(buffer));
    let result = {},
      name = '';
    let {
      cmd,
      payload
    } = msg;
    let xors = cache.get(STORAGE.CRYPTO_RANDOM);
    let stream = common.decrypto(msg.payload, xors);
    let codec = null;
    let currentUser = io.getCurrentUser();
    switch (cmd) {
      case SIGNAL_CMD.CONNECT_ACK:
        codec = $root.lookup('codec.ConnectAckMsgBody');
        let connectAckMsg = codec.decode(stream);
        result = utils.extend(result, {
          ack: connectAckMsg,
          index: CONNECT_ACK_INDEX,
          extra: connectAckMsg.ext
        });
        name = SIGNAL_NAME.S_CONNECT_ACK;
        break;
      case SIGNAL_CMD.PUBLISH_ACK:
        codec = $root.lookup('codec.PublishAckMsgBody');
        let pubAckMsgBody = codec.decode(stream);
        let {
          index,
          msgId: messageId,
          timestamp: sentTime,
          code,
          msgIndex,
          memberCount,
          modifiedMsg
        } = pubAckMsgBody;
        if (modifiedMsg) {
          let {
            msgContent,
            msgType
          } = modifiedMsg;
          if (msgContent && msgContent.length > 0) {
            let content = new TextDecoder().decode(msgContent);
            modifiedMsg = {
              msgContent: utils.parse(content),
              msgType
            };
          }
        }
        result = {
          messageId,
          sentTime,
          index,
          isSender: true,
          code,
          msgIndex,
          memberCount,
          modifiedMsg
        };
        break;
      case SIGNAL_CMD.PUBLISH:
        currentUser = io.getCurrentUser();
        let {
          _msg,
          _name
        } = getPublishMsgBody(stream, {
          currentUser
        });
        name = _name;
        result = _msg;
        break;
      case SIGNAL_CMD.QUERY_ACK:
        currentUser = io.getCurrentUser();
        result = getQueryAckBody(stream, {
          cache,
          currentUser
        });
        name = SIGNAL_NAME.S_QUERY_ACK;
        break;
      case SIGNAL_CMD.PONG:
        result = {
          index: PONG_INDEX
        };
        name = SIGNAL_NAME.S_PONG;
        break;
      case SIGNAL_CMD.DISCONNECT:
        codec = $root.lookup('codec.DisconnectMsgBody');
        let disconnectMsgBody = codec.decode(stream);
        result = utils.extend(result, {
          extra: disconnectMsgBody.ext,
          code: disconnectMsgBody.code
        });
        break;
    }
    return {
      cmd,
      result,
      name
    };
  };
  return {
    decode
  };
}

let detect = (urls, callback, option = {}) => {
  let requests = [],
    superior = '',
    errors = [];
  utils.forEach(urls, domain => {
    let {
      http
    } = utils.getProtocol();
    domain = domain.replace(/http:\/\/|https:\/\/|file:\/\/|wss:\/\/|ws:\/\//g, '');
    let url = `${http}//${domain}/health`;
    let options = {};
    let xhr = jrequest.requestNormal(url, options, {
      success: function (result, $xhr) {
        if (utils.isEmpty(superior)) {
          let {
            responseURL
          } = $xhr;
          superior = responseURL.replace(/(https:\/\/|http:\/\/)|(\/health)/g, '');
          callback(superior);
          abortAll();
        }
      },
      fail: function (error) {
        errors.push(error);
        if (utils.isEqual(errors.length, urls.length)) {
          callback(superior, error);
        }
      }
    });
    requests.push(xhr);
  });
  function abortAll() {
    utils.forEach(requests, xhr => {
      xhr.abort();
    });
    requests = [];
  }
};
let getNavis = (urls, option, callback) => {
  let {
    logger
  } = option;
  logger.info({
    tag: LOG_MODULE.NAV_START,
    urls
  });
  let requests = [],
    isResponsed = false,
    errors = [];
  let {
    appkey,
    token
  } = option;

  // 通过 AppKey_Token 获取 userId
  let tokenKey = common.getTokenKey(appkey, token);
  let userId = Storage.get(tokenKey);
  if (!utils.isEmpty(userId)) {
    Storage.setPrefix(`${appkey}_${userId}`);
  }
  let key = common.getNaviStorageKey(appkey, userId);
  let navi = Storage.get(key);
  if (!utils.isEmpty(navi)) {
    logger.info({
      tag: LOG_MODULE.NAV_REQEST,
      local: navi
    });
    return callback(navi);
  }
  utils.forEach(urls, domain => {
    let url = domain.replace(/http:\/\/|https:\/\/|file:\/\//g, '');
    let {
      http
    } = utils.getProtocol(domain);
    url = `${http}//${url}/navigator/general`;
    let options = {
      headers: {
        'x-appkey': appkey,
        'x-token': token
      }
    };
    let xhr = jrequest.requestNormal(url, options, {
      success: function (result, $xhr) {
        if (!isResponsed) {
          let {
            responseURL
          } = $xhr;
          let goodUrl = responseURL.replace(/(\/navigator\/general)/g, '');
          isResponsed = true;
          let {
            code,
            data = {}
          } = result;
          let {
            servers,
            user_id: userId
          } = data;

          // 默认规则：导航和 CMP 的协议必须一致
          let nav = {
            servers,
            userId,
            code,
            url: goodUrl
          };
          if (!utils.isEmpty(servers)) {
            // 优先设置本地 AppKey 和 Token 缓存的 UserId
            Storage.set(tokenKey, userId);

            // 设置全局存储前缀
            Storage.setPrefix(`${appkey}_${userId}`);

            // 设置导航缓存
            key = common.getNaviStorageKey();
            Storage.set(key, nav);
            logger.info({
              tag: LOG_MODULE.NAV_REQEST,
              remote: nav
            });
          }
          callback(nav);
          abortAll();
        }
      },
      fail: function (error) {
        errors.push(error);
        if (utils.isEqual(errors.length, urls.length)) {
          callback(error.result);
        }
      }
    });
    requests.push(xhr);
  });
  function abortAll() {
    utils.forEach(requests, xhr => {
      xhr.abort();
    });
    requests = [];
  }
};
var Network = {
  detect,
  getNavis
};

function Consumer() {
  let items = [];
  let isFinished = false;
  let isExecing = false;
  let produce = (item, isSyncing) => {
    if (isSyncing) {
      return items.unshift(item);
    }
    items.push(item);
  };
  let consume = invoke => {
    // 如果正在执行，终止本次任务，执行任务结束后自动消费队列 ntf, 1 是首次，所以判断大于 1
    if (isExecing) {
      return;
    }
    isExecing = true;

    // 队列消费结束，标志完成，此处先判断是否完成，再截取数组，避免数组长度为 1 时，最后一次被丢弃
    isFinished = utils.isEqual(items.length, 0);
    let item = items.shift();
    let result = {
      item
    };
    let next = () => {
      isExecing = false;
      consume(invoke);
    };
    if (isFinished) {
      isExecing = false;
    } else {
      invoke(result, next);
    }
  };
  return {
    consume,
    produce
  };
}

function MessageSyncer(send, emitter, io, {
  logger
}) {
  let consumer = Consumer();
  let exec = data => {
    consumer.produce(data);
    consumer.consume(({
      item
    }, next) => {
      let {
        name
      } = item;
      if (utils.isEqual(name, SIGNAL_NAME.CMD_RECEIVED)) {
        publish(item, next);
      }
      if (utils.isEqual(name, SIGNAL_NAME.S_SYNC_CONVERSATION_NTF)) {
        syncConversations(item, next);
      }
      if (utils.isEqual(name, SIGNAL_NAME.S_NTF)) {
        query(item, next);
      }
    });
    function publish(item, next) {
      let {
        msg
      } = item;
      let isNewMsg = common.updateSyncTime({
        ...msg,
        io
      });
      if (isNewMsg) {
        let {
          msgIndex,
          ackIndex
        } = msg;
        let data = {
          msgIndex,
          ackIndex
        };
        send(SIGNAL_CMD.PUBLISH_ACK, data);
        emitter.emit(SIGNAL_NAME.CMD_RECEIVED, msg);
      }
      next();
    }
    function query(item, next) {
      let {
        user,
        msg,
        name,
        $message
      } = item;
      let syncReceiveTime = Storage.get(STORAGE.SYNC_RECEIVED_MSG_TIME).time || 1700927161470;
      let syncSentTime = Storage.get(STORAGE.SYNC_SENT_MSG_TIME).time || 1700927161470;

      // 如果本地记录时间戳大于 ntf 中的接收时间，认为消息已被当前端接收过，不再执行拉取动作
      if (syncReceiveTime >= msg.receiveTime) {
        logger.info({
          tag: LOG_MODULE.MSG_SYNC,
          syncReceiveTime,
          msg
        });
        return next();
      }
      let data = {
        userId: user.id,
        syncTime: syncReceiveTime,
        containsSendBox: true,
        sendBoxSyncTime: syncSentTime,
        topic: COMMAND_TOPICS.SYNC_MESSAGES
      };
      send(SIGNAL_CMD.QUERY, data, ({
        isFinished,
        messages,
        code
      }) => {
        messages = messages || [];
        logger.info({
          tag: LOG_MODULE.MSG_SYNC,
          data,
          msg,
          code,
          count: messages.length
        });
        if (!utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
          return next();
        }
        let msgs = [];
        utils.forEach(messages, (message, index) => {
          let {
            flags,
            sentTime,
            isSender
          } = message;
          let msgFlag = common.formatter.toMsg(flags);
          if (msgFlag.isStorage) {
            msgs.push(message);
          }
        });
        $message.insertBatchMsgs({
          msgs: utils.clone(msgs)
        }).then(() => {
          utils.forEach(messages, (message, index) => {
            let {
              sentTime,
              isSender
            } = message;
            let isNewMsg = common.updateSyncTime({
              sentTime,
              isSender,
              io
            });
            if (isNewMsg) {
              let isFinishedAll = isFinished && utils.isEqual(messages.length - 1, index);
              emitter.emit(SIGNAL_NAME.CMD_RECEIVED, [message, isFinishedAll]);
            }
          });
          let isSyncing = !isFinished;
          if (isSyncing) {
            // 如果有未拉取，向队列下标最小位置插入消费对象，一次拉取执行完成后再处理它 ntf 或者 msg
            consumer.produce(item, isSyncing);
          }
          next();
        });
      });
    }
    function syncConversations(item, next) {
      let {
        user,
        name,
        time,
        $conversation
      } = item;
      let syncTime = Storage.get(STORAGE.SYNC_CONVERSATION_TIME).time || 0;
      if (syncTime > time) {
        logger.info({
          tag: LOG_MODULE.CONV_SYNC,
          syncTime,
          time
        });
        return next();
      }
      let data = {
        userId: user.id,
        syncTime: syncTime,
        topic: COMMAND_TOPICS.SYNC_CONVERSATIONS,
        count: 200
      };
      send(SIGNAL_CMD.QUERY, data, qryResult => {
        let {
          isFinished,
          conversations,
          code
        } = qryResult;
        logger.info({
          tag: LOG_MODULE.CONV_SYNC,
          data,
          code,
          count: conversations.length
        });
        if (!utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
          emitter.emit(SIGNAL_NAME.CMD_SYNC_CONVERSATION_FINISHED, {});
          return next();
        }
        let len = conversations.length;
        let conversation = conversations[len - 1] || {
          syncTime: 0
        };
        let {
          syncTime: newSyncTime
        } = conversation;
        if (newSyncTime > syncTime) {
          Storage.set(STORAGE.SYNC_CONVERSATION_TIME, {
            time: newSyncTime
          });
          item = utils.extend(item, {
            time: newSyncTime
          });
        }
        conversations = utils.clone(conversations);
        $conversation._batchInsertConversations({
          conversations,
          syncTime: newSyncTime
        }).then(result => {
          emitter.emit(SIGNAL_NAME.CMD_SYNC_CONVERSATIONS_PROGRESS, result);
          let isSyncing = !isFinished;
          if (isSyncing) {
            // 如果有未拉取，向队列下标最小位置插入消费对象，一次拉取执行完成后再处理它 ntf 或者 msg
            consumer.produce(item, isSyncing);
          } else {
            emitter.emit(SIGNAL_NAME.CMD_SYNC_CONVERSATION_FINISHED, {});
          }
          next();
        });
      });
    }
  };
  return {
    exec
  };
}

let chatroomCacher = Cache();
var chatroomCacher$1 = {
  set: (id, value) => {
    let result = chatroomCacher.get(id);
    let {
      msgs = []
    } = value;
    if (msgs.length >= 200) {
      msgs.shift(0);
      value = utils.extend(value, {
        msgs
      });
    }
    result = utils.extend(result, value);
    chatroomCacher.set(id, result);
  },
  get: id => {
    let result = chatroomCacher.get(id);
    return result;
  },
  remove: id => {
    chatroomCacher.remove(id);
  },
  getAll: () => {
    return chatroomCacher.getAll();
  }
};

function ChatroomSyncer(send, emitter, io, {
  logger
}) {
  let consumer = Consumer();
  let exec = data => {
    consumer.produce(data);
    consumer.consume(({
      item
    }, next) => {
      let {
        name
      } = item;
      if (utils.isEqual(name, SIGNAL_NAME.S_NTF)) {
        query(item, next);
      }
    });
    function query(item, next) {
      logger.info({
        tag: LOG_MODULE.MSG_SYNC,
        ...item
      });
      let {
        msg
      } = item;
      let _chatroomResult = chatroomCacher$1.get(msg.targetId);
      let {
        isJoined
      } = _chatroomResult;
      if (utils.isEqual(msg.type, NOTIFY_TYPE.CHATROOM)) {
        isJoined && queryChatroom(item, next);
      }
      if (utils.isEqual(msg.type, NOTIFY_TYPE.CHATROOM_DESTORY)) {
        isJoined && broadcastChatroomDestory(item, next);
      }
    }
    function broadcastChatroomDestory(item, next) {
      let {
        msg
      } = item;
      let chatroomId = msg.targetId;
      emitter.emit(SIGNAL_NAME.CMD_CHATROOM_DESTROY, {
        id: chatroomId
      });
      next();
    }
    function queryChatroom(item, next) {
      let {
        msg
      } = item;
      let chatroomId = msg.targetId;
      let syncTime = getChatroomSyncTime(chatroomId);
      if (syncTime >= msg.receiveTime && msg.receiveTime > 0) {
        logger.info({
          tag: LOG_MODULE.MSG_SYNC,
          syncTime,
          msg
        });
        return next();
      }
      if (msg.isNotSync) {
        logger.info({
          tag: LOG_MODULE.MSG_SYNC,
          syncTime,
          msg
        });
        setChatRoomSyncTime(msg.targetId, msg.receiveTime);
        return next();
      }
      let count = msg.count || 50;
      let data = {
        syncTime: syncTime,
        chatroomId: chatroomId,
        count: count,
        topic: COMMAND_TOPICS.SYNC_CHATROOM_MESSAGES
      };
      send(SIGNAL_CMD.QUERY, data, ({
        messages,
        code
      }) => {
        logger.info({
          tag: LOG_MODULE.MSG_SYNC,
          data,
          msg,
          code,
          count: messages.length
        });
        if (!utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
          return next();
        }
        let {
          msgs = []
        } = chatroomCacher$1.get(chatroomId);
        utils.forEach(messages, message => {
          setChatRoomSyncTime(message.conversationId, message.sentTime);
          let {
            messageId
          } = message;
          let isInclude = utils.isInclude(msgs, messageId);
          if (!isInclude) {
            msgs.push(messageId);
            emitter.emit(SIGNAL_NAME.CMD_RECEIVED, [message]);
          }
        });
        chatroomCacher$1.set(chatroomId, {
          msgs
        });
        next();
      });
    }
    function getChatroomSyncTime(chatroomId) {
      let result = chatroomCacher$1.get(chatroomId);
      return result.syncMsgTime || 0;
    }
    function setChatRoomSyncTime(chatroomId, time) {
      let currentTime = getChatroomSyncTime(chatroomId);
      if (time > currentTime) {
        chatroomCacher$1.set(chatroomId, {
          syncMsgTime: time
        });
      }
    }
  };
  return {
    exec
  };
}

function ChatroomAttSyncer(send, emitter, io, {
  logger
}) {
  let consumer = Consumer();
  let exec = data => {
    consumer.produce(data);
    consumer.consume(({
      item
    }, next) => {
      let {
        name
      } = item;
      if (utils.isEqual(name, SIGNAL_NAME.S_NTF)) {
        query(item, next);
      }
    });
    function query(item, next) {
      logger.info({
        tag: LOG_MODULE.MSG_SYNC,
        ...item
      });
      let {
        msg
      } = item;
      let _chatroomResult = chatroomCacher$1.get(msg.targetId);
      let {
        isJoined
      } = _chatroomResult;
      if (utils.isEqual(msg.type, NOTIFY_TYPE.CHATROOM_ATTR)) {
        isJoined && queryChatroomAttr(item, next);
      }
    }
    function queryChatroomAttr(item, next) {
      let {
        msg
      } = item;
      let chatroomId = msg.targetId;
      let syncTime = getChatroomAttrSyncTime(chatroomId);
      if (syncTime >= msg.receiveTime && msg.receiveTime > 0) {
        return next();
      }
      let data = {
        syncTime: syncTime,
        chatroomId: chatroomId,
        targetId: chatroomId,
        topic: COMMAND_TOPICS.SYNC_CHATROOM_ATTRS
      };
      send(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          attrs,
          chatroomId: _chatroomId
        } = result;
        logger.info({
          tag: LOG_MODULE.MSG_SYNC,
          data,
          msg,
          code,
          count: attrs.length
        });
        if (!utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
          return next();
        }
        utils.forEach(attrs, message => {
          setChatRoomAttrSyncTime(_chatroomId, message.updateTime);
        });
        emitter.emit(SIGNAL_NAME.CMD_CHATROOM_ATTR_RECEIVED, {
          attrs,
          chatroomId: _chatroomId
        });
        next();
      });
    }
    function getChatroomAttrSyncTime(chatroomId) {
      let syncInfo = chatroomCacher$1.get(chatroomId);
      return syncInfo.syncAttTime || 0;
    }
    function setChatRoomAttrSyncTime(chatroomId, time) {
      let currentTime = getChatroomAttrSyncTime(chatroomId);
      if (time > currentTime) {
        chatroomCacher$1.set(chatroomId, {
          syncAttTime: time
        });
      }
    }
  };
  return {
    exec
  };
}

function TagSyncer(send, emitter, io, {
  logger
}) {
  let exec = ({
    $conversation
  }) => {
    let {
      id: userId
    } = io.getCurrentUser();
    let data = {
      topic: COMMAND_TOPICS.CONVERSATION_TAG_QUERY,
      userId
    };
    io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
      let {
        code,
        tags
      } = result;
      if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
        utils.map(tags, tag => {
          let item = CONVERSATION_TAG[tag.id] || {};
          utils.extend(tag, item);
          return tag;
        });
        $conversation._batchInsertTags(tags).then(result => {
          emitter.emit(SIGNAL_NAME.CMD_SYNC_TAG_FINISHED, result);
        });
      }
    });
  };
  return {
    exec
  };
}

function Timer (_config = {}) {
  let config = {
    timeout: 1 * 60 * 1000
  };
  utils.extend(config, _config);
  let {
    timeout
  } = config;
  let interval = 0;
  let callback = utils.noop;
  let resume = _callback => {
    callback = _callback;
    interval = setInterval(() => {
      callback();
    }, timeout);
  };
  let pause = () => {
    clearInterval(interval);
  };
  let reset = () => {
    pause();
    resume(callback);
  };
  return {
    resume,
    pause,
    reset
  };
}

function Counter (_config = {}) {
  let config = {
    timeout: 1 * 10 * 1000
  };
  utils.extend(config, _config);
  let {
    timeout
  } = config;
  let num = 0;
  let start = callback => {
    num = setTimeout(() => {
      callback(config);
    }, timeout);
  };
  let clear = () => {
    clearTimeout(num);
  };
  return {
    start,
    clear
  };
}

let VERSION = '1.8.1';

var WebWS = WebSocket;

function UniWS (url) {
  let SOCKET_READY_STATE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  };
  let wsInstance = {
    readyState: SOCKET_READY_STATE.CONNECTING,
    onopen: () => {},
    onclose: () => {},
    onerror: () => {},
    onmessage: () => {}
  };
  let socketTask = uni.connectSocket({
    url: url,
    complete: () => {}
  });
  socketTask.onOpen(() => {
    wsInstance.readyState = SOCKET_READY_STATE.OPEN;
    wsInstance.onopen();
  });
  socketTask.onClose(() => {
    wsInstance.readyState = SOCKET_READY_STATE.CLOSED;
    wsInstance.onclose();
  });
  socketTask.onError(() => {
    wsInstance.readyState = SOCKET_READY_STATE.CLOSED;
    wsInstance.onerror();
  });
  socketTask.onMessage(data => {
    wsInstance.onmessage(data);
  });
  wsInstance.send = data => {
    socketTask.send({
      data
    });
  };
  wsInstance.close = () => {
    socketTask.close();
  };
  return wsInstance;
}

let JWebSocket = WebWS;
if (common.isUni()) {
  JWebSocket = UniWS;
}
var JWebSocket$1 = JWebSocket;

function NetworkWatcher (callbacks) {
  let onlineEvent = () => {
    let event = callbacks.ononline || utils.noop;
    event();
  };
  let watch = () => {
    if (typeof window == 'object' && window.addEventListener) {
      window.removeEventListener('online', onlineEvent);
      window.addEventListener('online', onlineEvent);
    }
  };
  return {
    watch
  };
}

/* 
  fileCompressLimit: 图片缩略图压缩限制，小于设置数值将不执行压缩，单位 KB
  config = { appkey, nav, isSync, upload, uploadType, fileCompressLimit }
*/
function IO(config) {
  let emitter = Emitter();
  let {
    appkey,
    navList,
    serverList = [],
    isSync = true,
    reconnectCount = 100,
    logger
  } = config;
  if (!utils.isArray(navList)) {
    navList = ['https://nav.fake.com'];
  }
  let ws = {};
  let io = {};
  let serverProviderCallback = utils.noop;
  let cache = Cache();
  let decoder = Decoder(cache, io);
  let encoder = Encoder(cache);
  let timer = Timer({
    timeout: HEART_TIMEOUT
  });
  let syncTimer = Timer({
    timeout: SYNC_MESSAGE_TIME
  });
  let isCurrentFirstConnect = true;
  let connectionState = CONNECT_STATE.DISCONNECTED;
  let reconnectErrors = [ErrorType.CONNECT_APPKEY_IS_REQUIRE.code, ErrorType.CONNECT_TOKEN_NOT_EXISTS.code, ErrorType.CONNECT_APPKEY_NOT_EXISTS.code, ErrorType.CONNECT_TOKEN_ILLEGAL.code, ErrorType.CONNECT_TOKEN_UNAUTHORIZED.code, ErrorType.CONNECT_TOKEN_EXPIRE.code, ErrorType.CONNECT_APP_BLOCKED.code, ErrorType.CONNECT_USER_BLOCKED.code, ErrorType.CONNECT_USER_KICKED.code, ErrorType.CONNECT_USER_LOGOUT.code];
  let updateState = result => {
    connectionState = result.state;
    emitter.emit(SIGNAL_NAME.CONN_CHANGED, {
      ...result
    });
  };
  let clearHeart = () => {
    timer.pause();
    syncTimer.pause();
  };
  function forceReconnect() {
    let user = getCurrentUser({
      ignores: []
    });
    clearHeart();
    cache.remove(CONNECT_TOOL.RECONNECT_COUNT);
    cache.remove(CONNECT_TOOL.RECONNECT_FREQUENCY);
    return reconnect(user, ({
      next
    }) => {
      next = next || utils.noop;
      next();
    });
  }
  let networkWatcher = NetworkWatcher({
    ononline: () => {
      if (ws.readyState == 3) {
        forceReconnect();
      }
    }
  });
  networkWatcher.watch();
  let isUserDisconnected = false;
  let onDisconnect = (result = {}) => {
    let {
      code
    } = result;
    let cbs = cache.getAll();
    utils.forEach(cbs, (val, key) => {
      if (!utils.isNaN(key)) {
        let {
          callback
        } = val;
        callback = callback || utils.noop;
        callback(ErrorType.COMMAND_FAILED);
        cache.remove(key);
      }
    });
    if (!isUserDisconnected && !utils.isInclude(reconnectErrors, code) && !utils.isEqual(connectionState, CONNECT_STATE.DISCONNECTED)) {
      let user = getCurrentUser({
        ignores: []
      });
      clearHeart();
      return reconnect(user, ({
        next
      }) => {
        next = next || utils.noop;
        next();
      });
    }
    if (!utils.isEqual(connectionState, CONNECT_STATE.DISCONNECTED)) {
      let user = getCurrentUser();
      updateState({
        state: CONNECT_STATE.DISCONNECTED,
        ...result,
        user
      });
      clearHeart();
    }
  };
  let currentUserInfo = {};
  let setCurrentUser = user => {
    utils.extend(currentUserInfo, user);
  };
  let clearLocalServers = userId => {
    let key = common.getNaviStorageKey(appkey, userId);
    Storage.remove(key);
  };
  let connect = ({
    token,
    deviceId,
    _isReconnect = false
  }, callback) => {
    cache.set(STORAGE.CRYPTO_RANDOM, utils.getRandoms(8));
    let _state = _isReconnect ? CONNECT_STATE.RECONNECTING : CONNECT_STATE.CONNECTING;
    updateState({
      state: _state
    });
    function smack({
      servers,
      userId
    }) {
      setCurrentUser({
        id: userId,
        token,
        deviceId
      });
      cache.set(SIGNAL_NAME.S_CONNECT_ACK, callback);
      Network.detect(servers, (domain, error) => {
        // 如果嗅探失败，返回连接断开，同时清理已缓存的 CMP 地址
        if (error) {
          serverProviderCallback(result => {
            result = utils.isObject(result) ? result : {};
            let {
              serverUrls
            } = result;
            serverUrls = serverUrls || [];
            if (serverUrls.length > 0) {
              serverList = serverUrls.concat(serverUrls);
              forceReconnect();
            }
          });
          clearLocalServers(userId);
          return reconnect({
            token,
            userId,
            deviceId
          }, callback);
        }
        domain = domain.replace(/http:\/\/|https:\/\/|file:\/\/|wss:\/\/|ws:\/\//g, '');
        let {
          ws: protocol
        } = utils.getProtocol();
        let url = `${protocol}//${domain}/im`;
        ws = new JWebSocket$1(url);
        logger.info({
          tag: LOG_MODULE.WS_CONNECT
        });
        ws.onopen = function () {
          let platform = PLATFORM.WEB;
          if (common.isDesktop()) {
            platform = PLATFORM.DESKTOP;
          }
          let clientSession = common.getClientSession();
          sendCommand(SIGNAL_CMD.CONNECT, {
            appkey,
            token,
            deviceId,
            platform,
            clientSession,
            sdkVerion: VERSION
          });
        };
        ws.onclose = e => {
          onDisconnect({
            type: DISCONNECT_TYPE.CLOSE
          });
        };
        ws.onerror = () => {
          onDisconnect({
            type: DISCONNECT_TYPE.ERROR
          });
        };
        ws.onmessage = function ({
          data
        }) {
          // 需要修改在适配层处理
          if (common.isUni()) {
            bufferHandler(data);
          } else {
            let reader = new FileReader();
            reader.onload = function () {
              bufferHandler(this.result);
            };
            reader.readAsArrayBuffer(data);
          }
        };
      });
    }
    if (!utils.isEmpty(serverList)) {
      return smack({
        servers: serverList
      });
    }
    return Network.getNavis(navList, {
      appkey,
      token,
      logger
    }, result => {
      let {
        code,
        servers,
        userId
      } = result;
      if (!utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
        let error = common.getError(code);
        clearLocalServers(userId);
        // 网络异常 code 为空，通过 code 检测是否为网络异常
        if (!code) {
          error = ErrorType.IM_SERVER_CONNECT_ERROR;
        }
        updateState({
          state: CONNECT_STATE.DISCONNECTED,
          code: error.code
        });
        return callback({
          error
        });
      }
      smack({
        servers,
        userId
      });
    });
  };
  let reconnectTimer = 0;
  let reconnect = ({
    token,
    userId,
    deviceId
  }, callback) => {
    clearTimeout(reconnectTimer);
    logger.info({
      tag: LOG_MODULE.CON_RECONNECT,
      userId,
      deviceId
    });
    let rCountObj = cache.get(CONNECT_TOOL.RECONNECT_COUNT);
    let count = rCountObj.count || 1;
    let isTimeout = count > reconnectCount;
    if (isTimeout) {
      cache.remove(CONNECT_TOOL.RECONNECT_COUNT);
      cache.remove(CONNECT_TOOL.RECONNECT_FREQUENCY);
      return updateState({
        state: CONNECT_STATE.DISCONNECTED,
        code: ErrorType.IM_SERVER_CONNECT_ERROR.code
      });
    }
    let reconnectOpt = cache.get(CONNECT_TOOL.RECONNECT_FREQUENCY);
    let frequency = reconnectOpt.frequency || 1;
    let msec = frequency * 1000;
    reconnectTimer = setTimeout(() => {
      count += 1;
      cache.set(CONNECT_TOOL.RECONNECT_COUNT, {
        count
      });
      frequency = frequency * 2;
      cache.set(CONNECT_TOOL.RECONNECT_FREQUENCY, {
        frequency
      });
      connect({
        token,
        userId,
        deviceId,
        _isReconnect: true
      }, result => {
        let {
          error
        } = result;
        if (utils.isEqual(error.code, ErrorType.COMMAND_SUCCESS.code)) {
          emitter.emit(SIGNAL_NAME.CMD_CHATROOM_REJOIN, {});
        }
        callback(result);
      });
    }, msec);
  };
  let PingTimeouts = [];
  let disconnect = () => {
    if (ws) {
      ws.close && ws.close();
    }
    timer.pause();
    syncTimer.pause();
    PingTimeouts.length = 0;
  };
  let userDisconnect = () => {
    isUserDisconnected = true;
    connectionState = CONNECT_STATE.DISCONNECTED;
    disconnect();
  };
  let sendCommand = (cmd, data, callback) => {
    callback = callback || utils.noop;
    let index = common.getNum();
    if (utils.isEqual(cmd, SIGNAL_CMD.CONNECT)) {
      index = CONNECT_ACK_INDEX;
    }
    if (utils.isEqual(cmd, SIGNAL_CMD.PING)) {
      index = PONG_INDEX;
    }
    let counter = Counter({
      cmd
    });
    let buffer = encoder.encode(cmd, {
      callback,
      data,
      index,
      counter
    });
    if (ws.readyState != 1) {
      disconnect();
      return callback(ErrorType.COMMAND_FAILED);
    }
    ws.send(buffer);
    let _data = utils.clone(data);
    delete _data.messages;
    if (_data.user) {
      _data.user = {
        id: _data.user.id
      };
    }
    logger.info({
      tag: LOG_MODULE.WS_SEND,
      cmd,
      ..._data
    });
    if (!utils.isEqual(SIGNAL_CMD.PUBLISH_ACK, cmd)) {
      // 请求发出后开始计时，一定时间内中未响应认为连接异常，断开连接，counter 定时器在收到 ack 后清除
      counter.start(({
        cmd: _cmd
      }) => {
        // PING 三次未响应后认为网络异常，向业务层抛出网络异常状态，PingTimeouts 在收到 PONG 后进行 reset
        if (utils.isEqual(_cmd, SIGNAL_CMD.PING) && PingTimeouts.length < 3) {
          return PingTimeouts.push({
            cmd: _cmd
          });
        }
        disconnect();
        callback(ErrorType.COMMAND_FAILED);
      });
    }
  };
  let messageSyncer = MessageSyncer(sendCommand, emitter, io, {
    logger
  });
  let chatroomSyncer = ChatroomSyncer(sendCommand, emitter, io, {
    logger
  });
  let chatroomAttrSyncer = ChatroomAttSyncer(sendCommand, emitter, io, {
    logger
  });
  let tagSyncer = TagSyncer(sendCommand, emitter, io, {
    logger
  });
  let bufferHandler = buffer => {
    let {
      cmd,
      result,
      name
    } = decoder.decode(buffer);
    logger.info({
      tag: LOG_MODULE.WS_RECEIVE,
      cmd,
      code: result.code
    });
    let {
      index
    } = result;
    let {
      callback,
      data,
      counter
    } = cache.get(index);
    // 清空计时器，与 counter.start 对应
    if (counter) {
      counter.clear();
      PingTimeouts.length = 0;
    }
    if (utils.isEqual(name, SIGNAL_NAME.S_CHATROOM_USER_NTF)) {
      let {
        chatroomId,
        time,
        type
      } = result;
      emitter.emit(SIGNAL_NAME.CMD_CHATROOM_EVENT, {
        chatroomId,
        time,
        type
      });
    }
    if (utils.isEqual(name, SIGNAL_NAME.S_STREAM_EVENT)) {
      let {
        conversationType,
        conversationId,
        messageId,
        streams
      } = result;
      let msgs = [],
        comps = [];
      utils.forEach(streams, stream => {
        let {
          event
        } = stream;
        if (utils.isEqual(event, STREAM_EVENT.MESSAGE)) {
          msgs.push(stream);
        }
        if (utils.isEqual(event, STREAM_EVENT.FINISHED)) {
          comps.push(stream);
        }
      });
      if (!utils.isEqual(msgs.length, 0)) {
        let _result = {
          conversationType,
          conversationId,
          messageId,
          streams: msgs
        };
        emitter.emit(SIGNAL_NAME.CMD_STREAM_APPENDED, _result);
      }
      if (!utils.isEqual(comps.length, 0)) {
        utils.forEach(comps, stream => {
          let _result = {
            conversationType,
            conversationId,
            messageId
          };
          emitter.emit(SIGNAL_NAME.CMD_STREAM_COMPLETED, _result);
        });
      }
    }
    if (utils.isEqual(name, SIGNAL_NAME.CMD_RECEIVED)) {
      messageSyncer.exec({
        msg: result,
        name: name,
        $message: config.$message,
        user: {
          id: currentUserInfo.id
        }
      });
      // 连接成功后会开始计时 3 分钟拉取逻辑，如果收到直发或者 NTF 重新开始计算时长，连接断开后会清空计时
      syncTimer.reset();
    }
    if (utils.isEqual(name, SIGNAL_NAME.S_NTF)) {
      let {
        type
      } = result;
      let _invokeItem = {
        msg: result,
        name: name,
        $message: config.$message,
        user: {
          id: currentUserInfo.id
        }
      };
      if (utils.isEqual(type, NOTIFY_TYPE.MSG)) {
        messageSyncer.exec(_invokeItem);
      }
      if (utils.isEqual(type, NOTIFY_TYPE.CHATROOM) || utils.isEqual(type, NOTIFY_TYPE.CHATROOM_DESTORY)) {
        chatroomSyncer.exec(_invokeItem);
      }
      if (utils.isEqual(type, NOTIFY_TYPE.CHATROOM_ATTR)) {
        chatroomAttrSyncer.exec(_invokeItem);
      }

      // 连接成功后会开始计时 3 分钟拉取逻辑，如果收到直发或者 NTF 重新开始计算时长，连接断开后会清空计时
      syncTimer.reset();
    }
    if (utils.isEqual(cmd, SIGNAL_CMD.PUBLISH_ACK)) {
      utils.extend(data, result);
      let {
        conversationType
      } = data;
      // 单群聊和聊天室通知和拉取消息时间戳分开计算，只有发送单群聊消息更新发件箱
      if (!utils.isEqual(conversationType, CONVERATION_TYPE.CHATROOM)) {
        common.updateSyncTime({
          ...data,
          io
        });
      }
      callback(data);
    }
    if (utils.isEqual(cmd, SIGNAL_CMD.QUERY_ACK)) {
      callback && callback(result);
    }
    if (utils.isEqual(cmd, SIGNAL_CMD.CONNECT_ACK)) {
      isUserDisconnected = false;
      let _callback = cache.get(SIGNAL_NAME.S_CONNECT_ACK) || utils.noop;
      let {
        ack: {
          code,
          userId,
          timestamp: ackTime
        }
      } = result;
      let state = CONNECT_STATE.CONNECT_FAILED;
      let error = common.getError(code);
      if (utils.isEqual(code, ErrorType.CONNECT_SUCCESS.code)) {
        // 会话列表 IM Server 维护，Web 端首次连接，不拉取离线消息，开发者只需要获取最新的会话列表即可
        if (isCurrentFirstConnect && !config.isPC) {
          common.updateSyncTime({
            sentTime: ackTime,
            isSender: true,
            io
          });
          common.updateSyncTime({
            sentTime: ackTime,
            isSender: false,
            io
          });
        }
        isCurrentFirstConnect = false;
        state = CONNECT_STATE.CONNECTED;
        setCurrentUser({
          id: userId
        });
        // 兼容只设置 IM Server 列表的情况
        Storage.setPrefix(`${appkey}_${userId}`);
        cache.remove(CONNECT_TOOL.RECONNECT_FREQUENCY);
        return getUserInfo({
          id: userId
        }, ({
          user: _user
        }) => {
          _user = _user || {};
          let name = _user.nickname;
          let portrait = _user.userPortrait;
          let exts = utils.toObject(_user.extFields);
          setCurrentUser({
            name,
            portrait,
            exts,
            updatedTime: _user.updatedTime
          });

          // 首先返回连接方法回调，确保 PC 端本地数据库同步信息时间戳优先更新至 localStorage 中
          _callback({
            user: currentUserInfo,
            error,
            next: () => {
              updateState({
                state,
                user: currentUserInfo
              });
            }
          });

          // 同步会话和同步消息顺序不能调整，保证先同步会话再同步消息，规避会话列表最后一条消息不是最新的
          if (config.isPC) {
            let syncNext = () => {
              messageSyncer.exec({
                time: Storage.get(STORAGE.SYNC_CONVERSATION_TIME).time || 0,
                name: SIGNAL_NAME.S_SYNC_CONVERSATION_NTF,
                user: {
                  id: currentUserInfo.id
                },
                $conversation: config.$conversation
              });
              syncMsgs();
              tagSyncer.exec({
                $conversation: config.$conversation
              });
            };

            // PC 中先连接后打开数据库，优先将本地数据库中的同步时间更新至 LocalStorage 中，避免换 Token 不换用户 Id 重复同步会话
            let syncTime = Storage.get(STORAGE.SYNC_CONVERSATION_TIME).time || 0;
            if (utils.isEqual(syncTime, 0)) {
              config.$socket.openDB({
                appkey,
                userId,
                token: currentUserInfo.token
              }).then(() => {
                syncNext();
              });
            } else {
              syncNext();
            }
          } else {
            syncMsgs();
          }
          timer.resume(() => {
            sendCommand(SIGNAL_CMD.PING, {});
            logger.info({
              tag: LOG_MODULE.HB_START
            });
          });
          syncTimer.resume(() => {
            messageSyncer.exec({
              msg: {
                type: NOTIFY_TYPE.MSG
              },
              name: SIGNAL_NAME.S_NTF,
              $message: config.$message,
              user: {
                id: currentUserInfo.id
              }
            });
          });
        });
      }
      if (utils.isEqual(code, ErrorType.CONNECT_SECURITY_DOMAIN_ERROR.code)) {
        // 防止 WebScoket 断开自动重连
        isUserDisconnected = true;
      }
      updateState({
        state,
        user: currentUserInfo,
        code
      });
      _callback({
        user: currentUserInfo,
        error
      });
    }
    if (utils.isEqual(cmd, SIGNAL_CMD.DISCONNECT)) {
      let {
        code,
        extra
      } = result;
      onDisconnect({
        code,
        extra,
        type: DISCONNECT_TYPE.SERVER
      });
    }
    if (utils.isEqual(name, SIGNAL_NAME.S_PONG)) {
      logger.info({
        tag: LOG_MODULE.HB_STOP
      });
    }
    if (utils.isEqual(name, SIGNAL_NAME.S_RTC_INVITE_NTF)) {
      emitter.emit(SIGNAL_NAME.CMD_RTC_INVITE_EVENT, result);
    }
    if (utils.isEqual(name, SIGNAL_NAME.S_RTC_ROOM_EVENT)) {
      let {
        roomEventType,
        room,
        members,
        reason
      } = result;
      emitter.emit(SIGNAL_NAME.CMD_RTC_ROOM_EVENT, {
        roomEventType,
        room,
        members,
        reason
      });
    }
    cache.remove(index);
  };
  function syncMsgs() {
    if (isSync) {
      messageSyncer.exec({
        msg: {
          type: NOTIFY_TYPE.MSG
        },
        name: SIGNAL_NAME.S_NTF,
        $message: config.$message,
        user: {
          id: currentUserInfo.id
        }
      });
    }
  }
  let isConnected = () => {
    return utils.isEqual(connectionState, CONNECT_STATE.CONNECTED);
  };
  let isNeedConnect = () => {
    return utils.isEqual(connectionState, CONNECT_STATE.DISCONNECTED);
  };
  function getCurrentUser(options = {}) {
    let {
      ignores = ['token']
    } = options;
    let user = utils.clone(currentUserInfo);
    utils.forEach(ignores, key => {
      delete user[key];
    });
    return user;
  }
  function getConfig() {
    return config;
  }
  function setConfig(cfg) {
    utils.extend(config, cfg);
  }
  function getUserInfo(user, callback) {
    let data = {
      topic: COMMAND_TOPICS.GET_USER_INFO,
      userId: user.id
    };
    sendCommand(SIGNAL_CMD.QUERY, data, result => {
      callback(result);
    });
  }
  utils.extend(io, {
    getConfig,
    setConfig,
    connect,
    disconnect: userDisconnect,
    sendCommand,
    isConnected,
    isNeedConnect,
    getCurrentUser,
    setServerUrlProider: callback => {
      serverProviderCallback = callback;
    },
    getVersion: () => {
      return VERSION;
    },
    sync: syncers => {
      syncers = utils.isArray(syncers) ? syncers : [syncers];
      let config = getConfig();
      utils.forEach(syncers, item => {
        let _item = {
          ...item,
          $message: config.$message
        };
        let {
          msg: {
            type
          }
        } = item;
        if (utils.isEqual(type, NOTIFY_TYPE.CHATROOM)) {
          chatroomSyncer.exec(_item);
        }
        if (utils.isEqual(type, NOTIFY_TYPE.CHATROOM_ATTR)) {
          chatroomAttrSyncer.exec(_item);
        }
      });
    },
    ...emitter
  });
  return io;
}

let isGroup = type => {
  return utils.isEqual(CONVERATION_TYPE.GROUP, type);
};
let formatMsg = ({
  message,
  senders,
  groups
}) => {
  let {
    content = '{}',
    senderId,
    conversationType,
    conversationId,
    mentionInfo = '{}',
    isRead,
    isStream,
    streams,
    isSender,
    isUpdated,
    referMsg = '{}',
    mergeMsg = '{}',
    reactions = '{}',
    attribute = ''
  } = message;
  content = utils.parse(content);
  mentionInfo = utils.parse(mentionInfo);
  let sender = utils.filter(senders, user => {
    return utils.isEqual(user.id, senderId);
  })[0] || {};
  let target = {};
  if (isGroup(conversationType)) {
    target = utils.filter(groups, group => {
      return utils.isEqual(group.id, conversationId);
    })[0] || {};
  } else {
    target = utils.filter(senders, user => {
      return utils.isEqual(user.id, conversationId);
    })[0] || {};
  }
  if (!streams) {
    streams = '[]';
  }
  streams = utils.parse(streams);
  message = utils.extend(message, {
    mergeMsg: utils.parse(mergeMsg),
    referMsg: utils.parse(referMsg),
    reactions: utils.parse(reactions),
    conversationTitle: target.name,
    conversationPortrait: target.portrait,
    conversationExts: target.exts,
    content,
    sender,
    mentionInfo,
    streams,
    isStream: Boolean(isStream),
    sentTime: Number(message.sentTime),
    isRead: Boolean(isRead),
    isSender: Boolean(isSender),
    isUpdated: Boolean(isUpdated),
    attribute
  });
  return message;
};
let formatMsgs = ({
  messages,
  senders,
  groups
}) => {
  let _messages = utils.map(messages, message => {
    let msg = formatMsg({
      message,
      senders,
      groups
    });
    return msg;
  });
  return _messages;
};
let formatConversation = ({
  conversation,
  users,
  groups
}) => {
  if (utils.isEmpty(conversation)) {
    return conversation;
  }
  let {
    id,
    type,
    draft,
    unreadCount,
    isTop,
    undisturbType,
    sortTime,
    mentions,
    latestMessageTid,
    latestMessageId,
    latestMessageName,
    latestMessageIsSender,
    latestMessageIsUpdated,
    latestMessageSentTime,
    latestMessageSenderId,
    latestMessageContent,
    latestMessageMessageIndex,
    latestMessageIsRead,
    latestMessageIsMass,
    latestUnreadCount,
    latestReadCount,
    latestReadIndex,
    latestUnreadIndex,
    latestMentionInfo,
    unreadTag
  } = conversation;
  mentions = mentions || '{}';
  let sender = utils.filter(users, user => {
    return utils.isEqual(user.id, latestMessageSenderId);
  })[0] || {
    id: latestMessageSenderId
  };
  let target = {};
  if (isGroup(type)) {
    target = utils.filter(groups, group => {
      return utils.isEqual(group.id, id);
    })[0] || {
      id
    };
  } else {
    target = utils.filter(users, user => {
      return utils.isEqual(user.id, id);
    })[0] || {
      id
    };
  }
  unreadCount = unreadCount > 0 ? unreadCount : 0;
  let _conversation = {
    conversationId: id,
    conversationType: type,
    conversationPortrait: target.portrait,
    conversationTitle: target.name,
    conversationExts: target.exts,
    draft: draft || "",
    isTop: Boolean(isTop),
    undisturbType: undisturbType,
    latestReadIndex: Number(latestReadIndex),
    latestUnreadIndex: Number(latestUnreadIndex),
    latestMessage: {
      conversationId: id,
      conversationType: type,
      conversationPortrait: target.portrait,
      conversationTitle: target.name,
      conversationExts: target.exts,
      content: utils.parse(latestMessageContent),
      isRead: Boolean(latestMessageIsRead),
      isSender: Boolean(latestMessageIsSender),
      isUpdated: Boolean(latestMessageIsUpdated),
      isMass: Boolean(latestMessageIsMass),
      messageId: latestMessageId,
      tid: latestMessageTid,
      mentionInfo: utils.parse(latestMentionInfo),
      messageIndex: latestMessageMessageIndex,
      name: latestMessageName,
      readCount: Number(latestReadCount || 0),
      unreadCount: Number(latestUnreadCount || 0),
      sentTime: Number(latestMessageSentTime),
      referMsg: {},
      sender: sender
    },
    sortTime: Number(sortTime) || 0,
    unreadCount: unreadCount || 0,
    mentions: utils.parse(mentions),
    unreadTag: unreadTag || UNREAD_TAG.READ
  };
  if (utils.isEmpty(latestMessageId)) {
    _conversation.latestMessage = {};
  }
  return _conversation;
};
let formatConversations = ({
  conversations,
  users,
  groups
}) => {
  let _converations = utils.map(conversations, conversation => {
    let _converation = formatConversation({
      conversation,
      users,
      groups
    });
    return _converation;
  });
  return _converations;
};
let createMentions = (mentions, message, user) => {
  let {
    mentionInfo
  } = message;
  let {
    senders = [],
    msgs = []
  } = mentions;
  if (utils.isEqual(message.name, MESSAGE_TYPE.RECALL_INFO)) {
    let {
      content: {
        messageId
      },
      sender
    } = message;
    let msgIndex = utils.find(msgs, msg => {
      return utils.isEqual(msg.messageId, messageId);
    });
    if (msgIndex > -1) {
      msgs.splice(msgIndex, 1);
    }

    // 如果没有消息撤回发送人的消息，移除 senders 中的发送人信息
    let isIncludeSender = utils.find(msgs, msg => {
      return utils.isEqual(msg.senderId, sender.id);
    }) > -1;
    if (!isIncludeSender) {
      let senderIndex = utils.find(senders, member => {
        return utils.isEqual(message.sender.id, member.id);
      });
      if (!utils.isEqual(senderIndex, -1)) {
        senders.splice(senderIndex, 1);
      }
    }
    let count = msgs.length;
    return {
      isMentioned: count > 0,
      senders,
      msgs,
      count: count
    };
  }
  if (utils.isEqual(message.name, MESSAGE_TYPE.CLIENT_REMOVE_MSGS)) {
    let {
      content: {
        messages
      },
      sender
    } = message;
    let senderIds = {};
    utils.forEach(messages, ({
      messageId
    }) => {
      let msgIndex = utils.find(msgs, msg => {
        let isSame = utils.isEqual(msg.messageId, messageId);
        if (isSame) {
          senderIds[msg.senderId] = msg.senderId;
        }
        return isSame;
      });
      if (msgIndex > -1) {
        msgs.splice(msgIndex, 1);
      }
    });
    utils.forEach(senderIds, senderId => {
      let isIncludeSender = utils.find(msgs, msg => {
        return utils.isEqual(msg.senderId, senderId);
      }) > -1;
      if (!isIncludeSender) {
        let senderIndex = utils.find(senders, member => {
          return utils.isEqual(senderId, member.id);
        });
        if (!utils.isEqual(senderIndex, -1)) {
          senders.splice(senderIndex, 1);
        }
      }
    });
    let count = msgs.length;
    return {
      isMentioned: count > 0,
      senders,
      msgs,
      count: count
    };
  }
  if (utils.isEmpty(mentionInfo)) {
    return mentions;
  }
  let {
    members,
    mentionType
  } = mentionInfo;
  let index = utils.find(members, member => {
    return utils.isEqual(user.id, member.id);
  });
  if (index > -1 || utils.isEqual(mentionType, MENTION_TYPE.ALL)) {
    msgs.push({
      senderId: message.sender.id,
      messageId: message.messageId,
      sentTime: message.sentTime,
      mentionType
    });
    let senderIndex = utils.find(senders, member => {
      return utils.isEqual(message.sender.id, member.id);
    });
    if (utils.isEqual(senderIndex, -1)) {
      senders.push(message.sender);
    }
  }
  let count = msgs.length;
  return {
    isMentioned: count > 0,
    senders,
    msgs,
    count: count
  };
};
function isNestInclude(sources, targets, callback) {
  let isOK = false;
  for (var i = 0; i < sources.length; i++) {
    for (var j = 0; j < targets.length; j++) {
      isOK = callback(sources[i], targets[j]);
      if (isOK) {
        break;
      }
    }
  }
  return isOK;
}
function hasUncompletedStream(messages) {
  let isInclude = false;
  for (var i = 0; i < messages.length; i++) {
    let message = messages[i];
    let {
      isStream,
      streams
    } = message;
    isStream = !!isStream;
    if (!streams) {
      streams = '[]';
    }
    streams = utils.parse(streams);
    if (isStream && utils.isEqual(streams.length, 0)) {
      isInclude = true;
      break;
    }
  }
  return isInclude;
}
var tools = {
  isGroup,
  formatMsg,
  formatMsgs,
  formatConversations,
  formatConversation,
  createMentions,
  isNestInclude,
  hasUncompletedStream
};

function Conversation$1 (io, emitter) {
  /*  
  1、内存中缓存最近 200 个会话，并按 message.sentTime 倒序排序
  2、startTime 是 0 时，优先返回内存中会话，内存数量小于 count 数，从服务端获取
  3、startTime 非 0 是，直接从服务端获取，并更新到内存中
  */
  let conversationUtils = common.ConversationUtils();
  io.on(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, message => {
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_MSG_EXSET)) {
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_DELETE_MSGS)) {
      return io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, {
        ...message,
        name: MESSAGE_TYPE.CLIENT_REMOVE_MSGS
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_ADD)) {
      let {
        content: {
          id,
          name,
          conversations
        }
      } = message;
      if (conversations.length > 0) {
        return emitter.emit(EVENT.TAG_CONVERSATION_ADDED, {
          id,
          conversations
        });
      }
      if (!utils.isEmpty(name) && conversations.length == 0) {
        return emitter.emit(EVENT.TAG_CHANGED, {
          tags: [{
            id,
            name
          }]
        });
      }
      return emitter.emit(EVENT.TAG_ADDED, {
        tags: [{
          id,
          name
        }]
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_REMOVE)) {
      let {
        content: {
          tags
        }
      } = message;
      return emitter.emit(EVENT.TAG_REMOVED, {
        tags: tags
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_REMOVE_CONVERS_FROM_TAG)) {
      let {
        content: {
          id,
          conversations
        }
      } = message;
      return emitter.emit(EVENT.TAG_CONVERSATION_REMOVED, {
        id,
        conversations
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_ADD_CONVER)) {
      let {
        content: _conversation
      } = message;
      conversationUtils.update(_conversation);
      let newConversation = conversationUtils.getPer(_conversation);
      return emitter.emit(EVENT.CONVERSATION_ADDED, {
        conversations: utils.clone([newConversation])
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_CLEAR_TOTALUNREAD)) {
      let {
        content: {
          clearTime
        }
      } = message;
      let conversations = conversationUtils.get();
      conversationUtils.read(conversations);
      return emitter.emit(EVENT.CLEAR_TOTAL_UNREADCOUNT, {
        clearTime
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_REMOVE_CONVERS)) {
      let {
        content: {
          conversations
        }
      } = message;
      let list = [];
      utils.forEach(conversations, item => {
        let _item = conversationUtils.remove(item);
        list.push(_item);
      });
      return emitter.emit(EVENT.CONVERSATION_REMOVED, {
        conversations: list
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_TOPCONVERS)) {
      let {
        content: {
          conversations
        }
      } = message;
      let item = conversations[0] || {
        isTop: false
      };
      let list = conversationUtils.modify(conversations, {
        isTop: item.isTop
      });
      emitter.emit(EVENT.CONVERSATION_TOP, {
        conversations
      });
      return emitter.emit(EVENT.CONVERSATION_CHANGED, {
        conversations: list
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_UNDISTURB)) {
      let {
        content: {
          conversations
        }
      } = message;
      let item = conversations[0] || {
        undisturbType: UNDISTURB_TYPE.UNDISTURB
      };
      let list = conversationUtils.modify(conversations, {
        undisturbType: item.undisturbType
      });
      emitter.emit(EVENT.CONVERSATION_UNDISTURBED, {
        conversations
      });
      return emitter.emit(EVENT.CONVERSATION_CHANGED, {
        conversations: list
      });
    }

    // 如果会话最后一条消息大于清理的时间，不更新会话列表
    if (utils.isEqual(message.name, MESSAGE_TYPE.CLEAR_MSG)) {
      let {
        content: {
          cleanTime,
          conversationType,
          conversationId,
          senderId
        }
      } = message;
      let params = {
        conversationType,
        conversationId
      };
      let conversation = conversationUtils.getPer(params) || params;
      let {
        latestMessage
      } = conversation || {};
      latestMessage = latestMessage || {
        sender: {
          id: ''
        }
      };
      if (cleanTime >= latestMessage.sentTime) {
        if (!utils.isEmpty(senderId) && !utils.isEqual(senderId, latestMessage.sender.id)) {
          return;
        }
        conversation.latestMessage = {};
        emitter.emit(EVENT.CONVERSATION_CHANGED, {
          conversations: [conversation]
        });
      }
      return;
    }
    if (utils.isEqual(MESSAGE_TYPE.CLIENT_REMOVE_MSGS, message.name)) {
      let {
        content: {
          messages
        }
      } = message;
      if (utils.isEmpty(messages)) {
        return;
      }
      let msg = messages[0];
      let conversation = conversationUtils.getPer(msg);
      if (utils.isEmpty(conversation)) {
        conversation = {
          latestMessage: {
            tid: ''
          }
        };
      }
      let tids = utils.map(messages, item => {
        return item.tid;
      });
      let {
        latestMessage
      } = conversation;
      // 只有会话最后一条消息被删除时触发会话列表变更或这删除的消息 @ 消息

      let mentions = conversation.mentions || {};
      let mentionMsgs = mentions.msgs || [];
      let isIncludeMsg = tools.isNestInclude(mentionMsgs, messages, (mentionMsg, msg) => {
        return utils.isEqual(mentionMsg.messageId, msg.tid);
      });
      let isLastMsg = utils.isInclude(tids, latestMessage.tid);
      if (isLastMsg || isIncludeMsg) {
        let _conversation = conversationUtils.getPer(message);
        let _mentions = _conversation.mentions || {};
        let current = io.getCurrentUser();
        _mentions = tools.createMentions(_mentions, message, current);
        let props = {
          mentions: _mentions
        };
        if (isLastMsg) {
          utils.extend(props, {
            latestMessage: {}
          });
        }
        let list = conversationUtils.modify(_conversation, props);
        emitter.emit(EVENT.CONVERSATION_CHANGED, {
          conversations: utils.clone(list)
        });
      }
      return;
    }
    // 如果会话最后一条消息和被撤回消息不匹配，不更新会话列表
    if (utils.isEqual(message.name, MESSAGE_TYPE.RECALL)) {
      let {
        content: {
          messageId
        }
      } = message;
      let conversation = conversationUtils.getPer(message);
      let {
        latestMessage,
        mentions
      } = conversation || {};
      latestMessage = latestMessage || {};
      let isLastMsg = utils.isEqual(latestMessage.messageId, messageId);
      mentions = mentions || {};
      let _msgs = mentions.msgs || [];
      let msgIndex = utils.find(_msgs, msg => {
        return utils.isEqual(msg.messageId, messageId);
      });
      if (!isLastMsg && utils.isEqual(msgIndex, -1)) {
        return;
      }

      // 对外模拟 recallinfo 消息
      message = utils.extend(message, {
        name: MESSAGE_TYPE.RECALL_INFO
      });
    }
    if (utils.isInclude([MESSAGE_TYPE.READ_MSG, MESSAGE_TYPE.READ_GROUP_MSG], message.name)) {
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.CLEAR_UNREAD)) {
      let {
        content
      } = message;
      let {
        conversations
      } = content;
      let list = conversationUtils.read(conversations);
      emitter.emit(EVENT.CONVERSATION_CLEARUNREAD, {
        conversations
      });
      if (!utils.isEmpty(list)) {
        emitter.emit(EVENT.CONVERSATION_CHANGED, {
          conversations: list
        });
      }
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_MARK_UNREAD)) {
      let {
        content: {
          conversations
        }
      } = message;
      let list = conversationUtils.modify(conversations);
      return emitter.emit(EVENT.CONVERSATION_CHANGED, {
        conversations: list
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.MODIFY)) {
      let conversation = conversationUtils.getPer(message);
      let {
        latestMessage
      } = conversation || {};
      latestMessage = latestMessage || {};
      // 如果会话最后一条消息和被修改消息不匹配，不更新会话列表
      if (!utils.isEqual(latestMessage.messageId, message.messageId)) {
        return;
      }
      utils.extend(message, {
        name: latestMessage.name,
        isUpdated: true
      });
    }
    next(message);
    function next(message) {
      let conversation = createConversation(message);
      if (conversationUtils.isExisted(conversation)) {
        conversationUtils.update(conversation);
        let updateConversation = conversationUtils.getPer(conversation);
        return emitter.emit(EVENT.CONVERSATION_CHANGED, {
          conversations: utils.clone([updateConversation])
        });
      }
      conversationUtils.add([conversation]);
      let newConversation = conversationUtils.getPer(conversation);
      emitter.emit(EVENT.CONVERSATION_ADDED, {
        conversations: utils.clone([newConversation])
      });
    }
  });
  io.on(SIGNAL_NAME.CLIENT_CLEAR_MEMORY_CACHE, () => {
    conversationUtils.clear();
  });
  let commandNotify = msg => {
    let config = io.getConfig();
    if (!config.isPC) {
      io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, msg);
    }
  };
  let getConversations = (params = {}) => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, []);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        count = 50,
        time = 0,
        conversationType,
        order = CONVERSATION_ORDER.FORWARD
      } = params;
      order = utils.isEqual(order, CONVERSATION_ORDER.FORWARD) ? CONVERSATION_ORDER.FORWARD : CONVERSATION_ORDER.BACKWARD;
      let user = io.getCurrentUser();
      let _params = {
        topic: COMMAND_TOPICS.CONVERSATIONS,
        time: 0,
        count,
        order,
        userId: user.id,
        conversationType
      };
      utils.extend(_params, params);
      io.sendCommand(SIGNAL_CMD.QUERY, _params, result => {
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        if (!utils.isUndefined(conversationType)) {
          let list = utils.map(result.conversations, item => {
            let {
              unreadCount
            } = item;
            item.unreadCount = unreadCount < 0 ? 0 : unreadCount;
            return item;
          });
          return resolve(utils.clone({
            conversations: list.reverse(),
            isFinished: result.isFinished
          }));
        }
        let {
          conversations
        } = result;
        conversationUtils.setSynced();
        conversationUtils.add(conversations);
        resolve({
          conversations: utils.clone(conversations),
          isFinished: result.isFinished
        });
      });
    });
  };
  let removeConversation = conversations => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversations, FUNC_PARAM_CHECKER.REMOVECONVERSATION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.REMOVE_CONVERSATION,
        conversations,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let list = utils.isArray(conversations) ? conversations : [conversations];
        let config = io.getConfig();
        let {
          timestamp,
          code
        } = result;
        list = utils.map(list, item => {
          item.time = timestamp;
          return item;
        });
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
        }
        if (!config.isPC) {
          let msg = {
            name: MESSAGE_TYPE.COMMAND_REMOVE_CONVERS,
            content: {
              conversations: list
            }
          };
          io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, msg);
        }
        resolve();
      });
    });
  };
  let insertConversation = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.INSERTCONVERSATION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.INSERT_CONVERSATION,
        conversation,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        msg,
        timestamp
      }) => {
        if (code) {
          return reject({
            code,
            msg
          });
        }
        common.updateSyncTime({
          isSender: true,
          sentTime: timestamp,
          io
        });
        let item = createConversation({
          ...conversation,
          sentTime: Date.now()
        });
        conversationUtils.update(item);
        let newConversation = conversationUtils.getPer(item);
        resolve({
          conversation: newConversation
        });
      });
    });
  };
  let getConversation = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GET_CONVERSATION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.GET_CONVERSATION,
        conversation,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        msg,
        conversation
      }) => {
        if (code) {
          return reject({
            code,
            msg
          });
        }
        if (!utils.isEmpty(conversation)) {
          conversationUtils.update(conversation);
        }
        resolve({
          conversation
        });
      });
    });
  };
  let disturbConversation = conversations => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversations, FUNC_PARAM_CHECKER.MUTE_CONVERSATION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.MUTE_CONVERSATION,
        conversations,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        msg,
        timestamp
      }) => {
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        common.updateSyncTime({
          isSender: true,
          sentTime: timestamp,
          io
        });
        let config = io.getConfig();
        if (!config.isPC) {
          let list = utils.isArray(conversations) ? conversations : [conversations];
          let msg = {
            name: MESSAGE_TYPE.COMMAND_UNDISTURB,
            content: {
              conversations: list
            }
          };
          io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, msg);
        }
        resolve();
      });
    });
  };
  let setTopConversation = conversations => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversations, FUNC_PARAM_CHECKER.SET_TOP_CONVERSATION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      conversations = utils.isArray(conversations) ? conversations : [conversations];
      let data = {
        topic: COMMAND_TOPICS.TOP_CONVERSATION,
        conversations,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        msg,
        timestamp
      }) => {
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        common.updateSyncTime({
          isSender: true,
          sentTime: timestamp,
          io
        });
        let config = io.getConfig();
        if (!config.isPC) {
          let msg = {
            name: MESSAGE_TYPE.COMMAND_TOPCONVERS,
            content: {
              conversations: conversations
            }
          };
          io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, msg);
        }
        resolve();
      });
    });
  };
  let getTopConversations = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, []);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      params = params || {};
      let {
        count = 50,
        time = 0
      } = params;
      let user = io.getCurrentUser();
      let _params = {
        topic: COMMAND_TOPICS.QUERY_TOP_CONVERSATIONS,
        time: 0,
        count,
        userId: user.id
      };
      utils.extend(_params, params);
      io.sendCommand(SIGNAL_CMD.QUERY, _params, result => {
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve({
          conversations: result.conversations,
          isFinished: result.isFinished
        });
      });
    });
  };
  let clearUnreadcount = conversations => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversations, FUNC_PARAM_CHECKER.CLEARUNREADCOUNT);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.CLEAR_UNREAD
      };
      utils.extend(data, {
        conversations,
        userId: user.id
      });
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
        }
        let config = io.getConfig();
        if (!config.isPC) {
          let msg = {
            name: MESSAGE_TYPE.CLEAR_UNREAD,
            content: {
              conversations
            }
          };
          io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, msg);
        }
        resolve();
      });
    });
  };
  let getTotalUnreadcount = (params = {}) => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, {}, {});
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        conversationTypes = [],
        ignoreConversations,
        tag
      } = params;
      conversationTypes = utils.isArray(conversationTypes) ? conversationTypes : [conversationTypes];
      if (!utils.isEmpty(ignoreConversations)) {
        let error = common.check(io, params, FUNC_PARAM_CHECKER.GET_TOTAL_UNREADCOUNT);
        if (!utils.isEmpty(error)) {
          return reject(error);
        }
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.GET_UNREAD_TOTLAL_CONVERSATION,
        userId,
        conversationTypes,
        ignoreConversations,
        tag
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        count
      }) => {
        count = count || 0;
        resolve({
          count
        });
      });
    });
  };
  let clearTotalUnreadcount = () => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, {}, {});
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.CLEAR_UNREAD_TOTLAL_CONVERSATION,
        userId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, () => {
        let conversations = conversationUtils.get();
        conversationUtils.read(conversations);
        resolve();
      });
    });
  };
  let setDraft = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.SET_DRAFT);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let key = common.getDraftKey(conversation);
      let {
        draft
      } = conversation;
      Storage.set(key, draft);
      resolve();
    });
  };
  let getDraft = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GET_DRAFT);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let key = common.getDraftKey(conversation);
      let draft = Storage.get(key);
      resolve(draft);
    });
  };
  let removeDraft = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GET_DRAFT);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let key = common.getDraftKey(conversation);
      let draft = Storage.remove(key);
      resolve(draft);
    });
  };
  function createConversation(message) {
    let {
      conversationId,
      conversationType,
      conversationTitle,
      conversationPortrait,
      conversationExts,
      mentionInfo,
      messageId
    } = message;
    let $conversation = {
      conversationId,
      conversationType,
      conversationTitle,
      conversationPortrait,
      conversationExts,
      latestMessage: message,
      unreadCount: 0,
      updatedTime: 0,
      undisturbType: message.undisturbType
    };
    let _conversation = conversationUtils.getPer(message);
    let mentions = _conversation.mentions || {};
    let user = io.getCurrentUser();
    mentions = tools.createMentions(mentions, message, user);
    if (message.isSender) {
      let conversation = conversationUtils.getPer(message);
      utils.extend($conversation, {
        conversationTitle: conversation.conversationTitle,
        conversationPortrait: conversation.conversationPortrait,
        conversationExts: conversation.conversationExts
      });
    }
    utils.extend($conversation, {
      mentions
    });
    return $conversation;
  }

  /* 
    let params = {
      type: UNDISTURB_TYPE.DISTURB,
      timezone: 'Asia/Shanghai',
      times: [
        { start: 'HH:mm', end: 'HH:mm' }
      ]
    };
  */
  let setAllDisturb = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.SET_ALL_DISTURB);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        code
      } = ErrorType.ILLEGAL_TYPE_PARAMS;
      let _params = {
        timezone: '',
        times: []
      };
      let {
        type,
        timezone,
        times
      } = params;
      let isDisturb = utils.isEqual(type, UNDISTURB_TYPE.DISTURB);
      if (isDisturb && !utils.isString(timezone)) {
        let msg = 'timezone 参数不合法，请检查，格式示例：Asia/Shanghai';
        return reject({
          msg,
          code
        });
      }
      if (isDisturb && !utils.isArray(times)) {
        let msg = "times 参数不合法，请检查，格式示例：[{ start: '12:00', end: '13:00' }]";
        return reject({
          msg,
          code
        });
      }
      let isValid = true;
      let timeIndex = 0;
      times = times || [];
      for (let i = 0; i < times.length; i++) {
        let time = times[i];
        if (!utils.isObject(time)) {
          isValid = false;
          timeIndex = i;
          break;
        }
        let {
          start,
          end
        } = time;
        if (!utils.isValidHMTime(start) || !utils.isValidHMTime(end)) {
          isValid = false;
          timeIndex = i;
          break;
        }
      }
      if (!isValid) {
        let msg = `times 下标 ${timeIndex} 参数，时间格式不正确`;
        return reject({
          msg,
          code
        });
      }
      _params = utils.extend(_params, params);
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.SET_ALL_DISTURB,
        userId,
        ..._params
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, () => {
        resolve();
      });
    });
  };
  let getAllDisturb = () => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, {}, {});
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.GET_ALL_DISTURB,
        userId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timezone,
          times,
          type,
          code
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg: ''
          });
        }
        resolve({
          timezone,
          times,
          type
        });
      });
    });
  };
  let markUnread = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.MARK_UNREAD);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      conversation = utils.clone(conversation);
      let {
        id: userId
      } = io.getCurrentUser();
      let conversations = utils.isArray(conversation) ? conversation : [conversation];
      let data = {
        topic: COMMAND_TOPICS.MARK_CONVERSATION_UNREAD,
        userId,
        conversations
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let config = io.getConfig();
          if (!config.isPC) {
            let msg = {
              name: MESSAGE_TYPE.COMMAND_MARK_UNREAD,
              content: {
                conversations
              }
            };
            io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, msg);
          }
          resolve();
        } else {
          let error = common.getError(code);
          reject(error);
        }
      });
    });
  };
  let createConversationTag = tag => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, tag, FUNC_PARAM_CHECKER.CREATE_CONVERSATION_TAG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let _tag = utils.clone(tag);
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.CONVERSATION_TAG_ADD,
        userId,
        tag: _tag
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let notify = {
            name: MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_ADD,
            content: {
              id: tag.id,
              name: tag.name,
              conversations: []
            }
          };
          commandNotify(notify);
          resolve();
        } else {
          let errorInfo = common.getError(code);
          reject(errorInfo);
        }
      });
    });
  };
  let destroyConversationTag = tag => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, tag, FUNC_PARAM_CHECKER.REMOVE_CONVERSATION_TAG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let _tag = utils.clone(tag);
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.TAG_REMOVE,
        userId,
        tag: _tag
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let tags = utils.isArray(tag) ? tag : [tag];
          let notify = {
            name: MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_REMOVE,
            content: {
              tags
            }
          };
          commandNotify(notify);
          resolve();
        } else {
          let errorInfo = common.getError(code);
          reject(errorInfo);
        }
      });
    });
  };
  let getConversationTags = () => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, {}, {});
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.CONVERSATION_TAG_QUERY,
        userId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code,
          tags
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          let _tags = utils.map(tags, tag => {
            let item = CONVERSATION_TAG[tag.id] || {};
            utils.extend(tag, item);
            return tag;
          });
          resolve({
            tags: _tags
          });
        } else {
          let error = common.getError(code);
          reject(error);
        }
      });
    });
  };
  let addConversationsToTag = tag => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, tag, FUNC_PARAM_CHECKER.ADD_CONVERSATION_TO_TAG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let _tag = utils.clone(tag);
      let {
        id: userId
      } = io.getCurrentUser();
      let conversations = utils.map(_tag.conversations, conversation => {
        return {
          conversationId: conversation.conversationId,
          conversationType: conversation.conversationType
        };
      });
      _tag = utils.extend(_tag, {
        conversations
      });
      let data = {
        topic: COMMAND_TOPICS.CONVERSATION_TAG_ADD,
        userId,
        tag: _tag
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let notify = {
            name: MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_ADD,
            content: {
              id: tag.id,
              conversations: conversations
            }
          };
          commandNotify(notify);
          resolve();
        } else {
          let error = common.getError(code);
          reject(error);
        }
      });
    });
  };
  let removeConversationsFromTag = tag => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, tag, FUNC_PARAM_CHECKER.REMOVE_CONVERSATION_FROM_TAG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let _tag = utils.clone(tag);
      let conversations = utils.map(_tag.conversations, conversation => {
        return {
          conversationId: conversation.conversationId,
          conversationType: conversation.conversationType
        };
      });
      _tag = utils.extend(_tag, {
        conversations
      });
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.CONVERSATION_TAG_REMOVE,
        userId,
        tag: _tag
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          timestamp,
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let notify = {
            name: MESSAGE_TYPE.COMMAND_REMOVE_CONVERS_FROM_TAG,
            content: {
              id: tag.id,
              conversations: conversations
            }
          };
          commandNotify(notify);
          resolve();
        } else {
          let error = common.getError(code);
          reject(error);
        }
      });
    });
  };
  return {
    getConversations,
    removeConversation,
    insertConversation,
    getConversation,
    markUnread,
    disturbConversation,
    setTopConversation,
    getTopConversations,
    clearUnreadcount,
    getTotalUnreadcount,
    clearTotalUnreadcount,
    setDraft,
    getDraft,
    removeDraft,
    setAllDisturb,
    getAllDisturb,
    createConversationTag,
    destroyConversationTag,
    getConversationTags,
    addConversationsToTag,
    removeConversationsFromTag
  };
}

function MessageCacher () {
  let cache = Cache();
  let getConversationId = ({
    conversationType,
    conversationId
  }) => {
    return `${conversationType}_${conversationId}`;
  };
  let add = (conversation, message) => {
    let list = utils.isArray(message) ? message : [message];
    let key = getConversationId(conversation);
    let messages = cache.get(key);
    if (utils.isEmpty(messages)) {
      messages = [];
    }
    messages = messages.concat(list);
    messages = utils.quickSort(messages, (a, b) => {
      return a.sentTime > b.sentTime;
    });
    if (messages.length > 10) {
      messages.length = 10;
    }
    cache.set(key, messages);
  };
  let isInclude = message => {
    let key = getConversationId(message);
    let messages = cache.get(key);
    if (utils.isEmpty(messages)) {
      messages = [];
    }
    let cacheMsgs = utils.filter(messages, item => {
      return utils.isEqual(item.sentTime, message.sentTime);
    });
    return cacheMsgs.length > 0;
  };
  let clear = () => {
    cache.clear();
  };
  return {
    add,
    isInclude,
    clear
  };
}

function Message$1 (io, emitter, logger) {
  let messageCacher = MessageCacher();
  io.on(SIGNAL_NAME.CMD_RECEIVED, (message, isPullFinished = true) => {
    logger.info({
      tag: LOG_MODULE.MSG_RECEIVE,
      messageId: message.messageId
    });
    let isChatroom = utils.isEqual(message.conversationType, CONVERATION_TYPE.CHATROOM);
    if (isChatroom) {
      let _chatroomResult = chatroomCacher$1.get(message.conversationId);
      return _chatroomResult.isJoined && emitter.emit(EVENT.MESSAGE_RECEIVED, [message, true]);
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_LOG_REPORT)) {
      let {
        content,
        messageId
      } = message;
      if (utils.isEqual('Web', content.platform)) {
        return common.reportLogs({
          logger,
          params: {
            ...content,
            messageId
          }
        });
      }
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.MODIFY)) {
      let {
        conversationType,
        conversationId,
        content: {
          content,
          messageId,
          sentTime
        }
      } = message;
      let newContent = content;
      if (utils.isBase64(content)) {
        let str = utils.decodeBase64(content);
        newContent = utils.parse(str);
      }
      return emitter.emit(EVENT.MESSAGE_UPDATED, {
        conversationType,
        conversationId,
        messageId,
        content: newContent
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_MSG_SET_TOP)) {
      let {
        conversationType,
        conversationId,
        content: {
          msg_id,
          action = 0
        },
        sender,
        sentTime
      } = message;
      let isTop = utils.isEqual(MSG_TOP_ACTION_TYPE.ADD, action);
      return emitter.emit(EVENT.MESSAGE_SET_TOP, {
        isTop,
        message: {
          conversationType,
          conversationId,
          messageId: msg_id
        },
        operator: sender,
        createdTime: sentTime
      });
    }

    // if(utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_RTC_1V1_FINISHED)){
    //   return emitter.emit(EVENT.RTC_FINISHED_1V1_EVENT, message);
    // }

    // 收到非聊天室消息一定要更新会话列表
    io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, utils.clone(message));
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_ADD)) {
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_CONVERSATION_TAG_REMOVE)) {
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_REMOVE_CONVERS_FROM_TAG)) {
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_DELETE_MSGS)) {
      let {
        content: {
          conversationId,
          conversationType,
          messages
        }
      } = message;
      return emitter.emit(EVENT.MESSAGE_REMOVED, {
        conversationId,
        conversationType,
        messages
      });
    }

    // 消息监听无需处理标记未读消息
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_MARK_UNREAD)) {
      return;
    }
    // 消息监听无需处理清理总数消息
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_CLEAR_TOTALUNREAD)) {
      return;
    }
    // 消息监听无需处理会话添加
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_ADD_CONVER)) {
      return;
    }
    // 消息监听无需处理会话删除
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_REMOVE_CONVERS)) {
      return;
    }
    // 消息监听无需处理会话置顶
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_TOPCONVERS)) {
      return;
    }
    // 消息监听无需处理免打扰
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_UNDISTURB)) {
      return;
    }
    //清理未读同步，只变更会话列表
    if (utils.isEqual(message.name, MESSAGE_TYPE.CLEAR_UNREAD)) {
      return;
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.RECALL)) {
      let {
        conversationId,
        conversationType,
        content,
        sender
      } = message;
      return emitter.emit(EVENT.MESSAGE_RECALLED, {
        conversationId,
        conversationType,
        content,
        sender
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.COMMAND_MSG_EXSET)) {
      let {
        content
      } = message;
      return emitter.emit(EVENT.MESSAGE_REACTION_CHANGED, {
        ...content
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.CLEAR_MSG)) {
      let {
        content: {
          conversationType,
          conversationId,
          cleanTime,
          senderId
        }
      } = message;
      if (!utils.isEmpty(senderId)) {
        return emitter.emit(EVENT.MESSAGE_CLEAN_SOMEONE, {
          conversationType,
          conversationId,
          senderId
        });
      }
      return emitter.emit(EVENT.MESSAGE_CLEAN, {
        conversationType,
        conversationId,
        cleanTime
      });
    }
    if (utils.isEqual(message.name, MESSAGE_TYPE.READ_MSG) || utils.isEqual(message.name, MESSAGE_TYPE.READ_GROUP_MSG)) {
      let {
        conversationType,
        conversationId,
        content: {
          msgs
        }
      } = message;
      let notify = {
        conversationType,
        conversationId,
        messages: msgs
      };
      return emitter.emit(EVENT.MESSAGE_READ, notify);
    }
    if (!messageCacher.isInclude(message)) {
      emitter.emit(EVENT.MESSAGE_RECEIVED, [message, isPullFinished]);
      let {
        conversationId,
        conversationType
      } = message;
      messageCacher.add({
        conversationId,
        conversationType
      }, message);
    }
  });
  let commandNotify = msg => {
    let config = io.getConfig();
    if (!config.isPC) {
      io.emit(SIGNAL_NAME.CMD_RECEIVED, msg);
    }
  };
  let maps = [[CONVERATION_TYPE.PRIVATE, 'p_msg'], [CONVERATION_TYPE.GROUP, 'g_msg'], [CONVERATION_TYPE.CHATROOM, 'c_msg']];
  let topics = {};
  utils.forEach(maps, map => {
    topics[map[0]] = map[1];
  });

  /*
    缓存发送的消息，同样的 tid 重复发送消息返回错误，不再调用 socket send 方法，规避消息重复发送
    sendingMsgMap[tid] = true;  
  */
  let sendingMsgMap = {};

  /*
  缓存发送失败的 clientMsgId，防止未收到 ACK，重发导致接收端消息重复
  sendMsgMap[tid] = uuid;  
  */
  let sendMsgMap = {};
  let sendMessage = (message, callbacks = {}) => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SENDMSG, true);
      if (!utils.isEmpty(error)) {
        return reject({
          error
        });
      }
      let {
        referMsg
      } = message;
      if (!utils.isUndefined(referMsg)) {
        let {
          messageIndex,
          messageId
        } = referMsg;
        if (utils.isUndefined(messageIndex) || utils.isUndefined(messageId)) {
          return reject({
            error: ErrorType.SEND_REFER_MESSAGE_ERROR
          });
        }
      }
      let sender = io.getCurrentUser() || {};
      let isSending = sendingMsgMap[message.tid];
      if (isSending) {
        return reject({
          ...message,
          sender,
          error: ErrorType.MESSAGE_SEND_REPETITION
        });
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND
      });
      let _callbacks = {
        onbefore: () => {}
      };
      utils.extend(_callbacks, callbacks);
      let tid = message.tid || utils.getUUID();
      let clientMsgId = sendMsgMap[tid] || utils.getUUID();
      sendMsgMap[tid] = clientMsgId;
      sendingMsgMap[tid] = true;
      let data = utils.clone({
        ...message,
        clientMsgId
      });
      let {
        name,
        conversationType,
        conversationId,
        isMass
      } = data;
      let flag = common.getMsgFlag(name, {
        isMass
      });
      utils.extend(data, {
        flag
      });
      let topic = topics[conversationType];
      utils.extend(data, {
        topic
      });
      utils.extend(message, {
        tid,
        sentState: MESSAGE_SENT_STATE.SENDING,
        sender,
        isSender: true
      });
      _callbacks.onbefore(utils.clone(message));
      if (!io.isConnected()) {
        delete sendingMsgMap[tid];
        return reject({
          ...message,
          sentState: MESSAGE_SENT_STATE.FAILED,
          error: ErrorType.CONNECTION_NOT_READY
        });
      }
      io.sendCommand(SIGNAL_CMD.PUBLISH, data, ({
        messageId,
        sentTime,
        code,
        msg,
        msgIndex,
        memberCount,
        modifiedMsg
      }) => {
        // 不管消息发送成功或失败，清理 tid 发送中的状态
        delete sendingMsgMap[tid];
        if (code) {
          utils.extend(message, {
            error: {
              code,
              msg
            },
            sentState: MESSAGE_SENT_STATE.FAILED
          });
          return reject(utils.clone(message));
        }

        // 消息发送成功，清理缓存消息
        delete sendMsgMap[tid];
        modifiedMsg = modifiedMsg || {};
        let {
          msgContent,
          msgType
        } = modifiedMsg;
        msgType = msgType || message.name;
        msgContent = msgContent || message.content;
        utils.extend(message, {
          name: msgType,
          content: msgContent,
          sentTime,
          messageId,
          messageIndex: msgIndex,
          sentState: MESSAGE_SENT_STATE.SUCCESS
        });
        let config = io.getConfig();
        if (!config.isPC && !utils.isEqual(conversationType, CONVERATION_TYPE.CHATROOM)) {
          io.emit(SIGNAL_NAME.CMD_CONVERSATION_CHANGED, message);
        }
        let isChatroom = utils.isEqual(message.conversationType, CONVERATION_TYPE.CHATROOM);
        if (isChatroom) {
          let {
            conversationId
          } = message;
          let {
            msgs = []
          } = chatroomCacher$1.get(conversationId);
          msgs.push(message.messageId);
          chatroomCacher$1.set(conversationId, {
            msgs
          });
        }
        let isGroup = utils.isEqual(message.conversationType, CONVERATION_TYPE.GROUP);
        if (isGroup) {
          message = utils.extend(message, {
            unreadCount: memberCount,
            readCount: 0
          });
        }
        resolve(message);
      });
    });
  };

  /* 
    let messages = [ Message, Message, ... ];  
    let callbacks = {
      onbefore: () => {},
      onprogress: ({ message, count, total }) => {},
      oncompleted: ({ messages }) => {},
    };
  */
  let sendMassMessage = (messages, callbacks = {}) => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, messages, FUNC_PARAM_CHECKER.SENDMSG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND_MASS
      });
      let _cbs = {
        onprogress: () => {},
        oncompleted: () => {}
      };
      utils.extend(_cbs, callbacks);
      messages = utils.isArray(messages) ? messages : [messages];
      messages = utils.map(messages, message => {
        return {
          isMass: true,
          ...message
        };
      });
      let _msgs = [];
      let total = messages.length;
      utils.iterator(messages, (message, next, isFinished) => {
        let _next = () => {
          if (isFinished) {
            resolve();
            return _cbs.oncompleted({
              messages: _msgs
            });
          }
          next();
        };
        let progress = msg => {
          _msgs.push(msg);
          _cbs.onprogress({
            message: msg,
            count: _msgs.length,
            total
          });
          _next();
        };
        sendMessage(message, callbacks).then(progress, progress);
      });
    });
  };
  let getMessages = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GETMSGS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        conversationId
      } = conversation;
      let {
        id: userId
      } = io.getCurrentUser();
      let params = {
        time: 0,
        order: MESSAGE_ORDER.BACKWARD,
        count: 20,
        userId: userId,
        topic: COMMAND_TOPICS.HISTORY_MESSAGES,
        targetId: conversationId,
        names: []
      };
      params = utils.extend(params, conversation);
      io.sendCommand(SIGNAL_CMD.QUERY, params, result => {
        let {
          messages,
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        // messageCacher.add(conversation, messages);
        resolve(result);
      });
    });
  };
  let getMessagesByIds = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.GETMSG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.GET_MSG_BY_IDS,
        userId: user.id
      };
      data = utils.extend(data, params);
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          messages,
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve({
          messages
        });
      });
    });
  };
  let clearMessage = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.CLEARMSG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      logger.info({
        tag: LOG_MODULE.MSG_CLEAR,
        ...params
      });
      let data = {
        topic: COMMAND_TOPICS.CLEAR_MESSAGE,
        time: 0
      };
      utils.extend(data, params);
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        timestamp
      }) => {
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let content = {
            conversationType: params.conversationType,
            conversationId: params.conversationId,
            cleanTime: params.time || 0
          };
          let {
            senderId
          } = params;
          if (!utils.isUndefined(senderId)) {
            utils.extend(content, {
              senderId
            });
          }
          let notify = {
            name: MESSAGE_TYPE.CLEAR_MSG,
            content: content
          };
          commandNotify(notify);
          resolve();
        } else {
          let errorInfo = common.getError(code);
          reject(errorInfo);
        }
      });
    });
  };
  let removeMessages = messages => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, messages, FUNC_PARAM_CHECKER.REMOVE_MSGS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      messages = utils.isArray(messages) ? messages : [messages];
      let list = utils.quickSort(utils.clone(messages), (a, b) => {
        return a.sentTime > b.sentTime;
      });
      let item = list[0] || {
        sentTime: -10
      };
      logger.info({
        tag: LOG_MODULE.MSG_DELETE,
        time: item.sentTime
      });
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.REMOVE_MESSAGE,
        messages,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        timestamp
      }) => {
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let _msgs = utils.map(messages, msg => {
            let {
              messageId,
              tid,
              conversationType,
              conversationId
            } = msg;
            return {
              messageId,
              tid,
              conversationType,
              conversationId
            };
          });
          let notify = {
            name: MESSAGE_TYPE.COMMAND_DELETE_MSGS,
            content: {
              conversationType: item.conversationType,
              conversationId: item.conversationId,
              messages: _msgs
            }
          };
          commandNotify(notify);
          resolve();
        } else {
          let errorInfo = common.getError(code);
          reject(errorInfo);
        }
      });
    });
  };
  /* 
    let message = {conversationType, conversationId, sentTime, messageId}
  */
  let recallMessage = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.RECALLMSG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let data = {
        topic: COMMAND_TOPICS.RECALL
      };
      utils.extend(data, message);
      logger.info({
        tag: LOG_MODULE.MSG_RECALL,
        messageId: message.messageId,
        sentTime: message.sentTime
      });
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          timestamp
        } = result;
        if (utils.isEqual(code, ErrorType.COMMAND_SUCCESS.code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let msg = utils.clone(message);
          let {
            messageId,
            sentTime,
            exts
          } = message;
          let sender = io.getCurrentUser();
          utils.extend(msg, {
            name: MESSAGE_TYPE.RECALL,
            sender,
            isSender: true,
            content: {
              messageId,
              sentTime,
              exts
            }
          });
          commandNotify(msg);
          utils.clone(msg);
          delete msg.exts;
          utils.extend(msg, {
            name: MESSAGE_TYPE.RECALL_INFO
          });
          return resolve(msg);
        }
        let {
          msg
        } = common.getError(code);
        reject({
          code,
          msg
        });
      });
    });
  };
  let readMessage = messages => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, messages, FUNC_PARAM_CHECKER.READMESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      messages = utils.isArray(messages) ? messages : [messages];
      messages = utils.map(messages, message => {
        let {
          conversationType,
          conversationId,
          messageId,
          sentTime
        } = message;
        return {
          conversationType,
          conversationId,
          messageId,
          sentTime
        };
      });
      let data = {
        topic: COMMAND_TOPICS.READ_MESSAGE,
        messages
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        timestamp
      }) => {
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          common.updateSyncTime({
            isSender: true,
            sentTime: timestamp,
            io
          });
          let conversation = messages[0];
          let notify = {
            name: MESSAGE_TYPE.READ_MSG,
            conversationType: conversation.conversationType,
            conversationId: conversation.conversationId,
            content: {
              msgs: messages
            }
          };
          commandNotify(notify);
        }
        resolve();
      });
    });
  };
  let getMessageReadDetails = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.GET_MESSAGE_READ_DETAILS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let data = {
        topic: COMMAND_TOPICS.GET_READ_MESSAGE_DETAIL,
        message
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        delete result.index;
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve(result);
      });
    });
  };
  let updateMessage = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.UPDATEMESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      logger.info({
        tag: LOG_MODULE.MSG_UPDATE,
        messageId: message.messageId
      });
      let msg = {
        ...utils.clone(message),
        name: MESSAGE_TYPE.MODIFY
      };
      let notify = (_msg = {}) => {
        utils.extend(msg, _msg);
        commandNotify(msg);
      };
      // 兼容 PC 端修改非 content 属性，保证多端行为一致性，直接返回，PC 端会做本地消息 update
      if (utils.isUndefined(message.content)) {
        notify();
        return resolve(msg);
      }
      let data = {
        topic: COMMAND_TOPICS.UPDATE_MESSAGE,
        ...message
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        let sender = io.getCurrentUser();
        notify({
          sender,
          isSender: true,
          isUpdated: true,
          content: {
            messageId: message.messageId,
            content: message.content
          }
        });
        resolve();
      });
    });
  };
  let getMentionMessages = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GET_MENTIOIN_MESSAGES);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let params = {
        count: 20,
        order: MENTION_ORDER.BACKWARD,
        messageIndex: 0
      };
      let user = io.getCurrentUser();
      utils.extend(params, conversation);
      let data = {
        topic: COMMAND_TOPICS.GET_MENTION_MSGS,
        userId: user.id,
        ...params
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          isFinished,
          msgs
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve({
          isFinished,
          msgs
        });
      });
    });
  };
  let getFileToken = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.GET_FILE_TOKEN);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.GET_FILE_TOKEN,
        ...params,
        userId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        cred,
        code
      }) => {
        cred = cred || {};
        resolve(cred);
      });
    });
  };
  /* options: fileType, Video and Image: scale: 0 ~ 1 */
  let _uploadFile = (options, message, callbacks = {}) => {
    let {
      uploadType,
      upload,
      fileCompressLimit
    } = io.getConfig();
    let _callbacks = {
      onprogress: () => {},
      onerror: () => {}
    };
    utils.extend(_callbacks, callbacks);
    let {
      fileType,
      scale
    } = options;
    let uploader = Uploder(upload, {
      type: uploadType
    });
    let {
      name,
      content
    } = message;
    let _file = content.file || {
      name: ''
    };
    let fileName = _file.name || content.tempPath;
    fileName = fileName || '';
    let names = fileName.split('.');
    let ext = names[names.length - 1];
    getFileToken({
      type: fileType,
      ext
    }).then(auth => {
      let {
        type
      } = auth;
      if (utils.isEqual(ErrorType.COMMAND_FAILED.code, auth.code)) {
        return _callbacks.onerror(ErrorType.COMMAND_FAILED);
      }
      if (!utils.isEqual(type, uploadType)) {
        return _callbacks.onerror(ErrorType.UPLOAD_PLUGIN_NOTMATCH);
      }
      let params = utils.extend(auth, {
        file: content.file,
        scale,
        fileCompressLimit
      });
      if (utils.isEqual(name, MESSAGE_TYPE.IMAGE)) {
        // 业务层设置缩略图，传入优先，不再执行生成缩略图逻辑
        let {
          thumbnail
        } = content;
        if (thumbnail) {
          return uploadFile(auth, message);
        }
        getFileToken({
          type: fileType,
          ext
        }).then(cred => {
          if (utils.isEqual(ErrorType.COMMAND_FAILED.code, cred.code)) {
            return _callbacks.onerror(ErrorType.COMMAND_FAILED);
          }
          common.uploadThumbnail(upload, {
            ...params,
            ...cred,
            content
          }, (error, thumbnail, args) => {
            let {
              height,
              width,
              isUniWebThumbnail
            } = args;
            utils.extend(message.content, {
              thumbnail,
              height,
              width,
              type: args.type
            });
            uploadFile({
              ...auth,
              isUniWebThumbnail
            }, message);
          });
        });
      }
      if (utils.isEqual(name, MESSAGE_TYPE.VIDEO)) {
        // 业务层设置封面，传入优先，不再执行生成缩略图逻辑
        let {
          poster
        } = content;
        if (poster) {
          return uploadFile(auth, message);
        }
        getFileToken({
          type: fileType,
          ext: 'png'
        }).then(cred => {
          if (utils.isEqual(ErrorType.COMMAND_FAILED.code, cred.code)) {
            return _callbacks.onerror(ErrorType.COMMAND_FAILED);
          }
          common.uploadFrame(upload, {
            ...params,
            ...cred,
            content
          }, (error, poster, args) => {
            let {
              height,
              width,
              duration
            } = args;
            utils.extend(message.content, {
              poster,
              height,
              width,
              duration
            });
            uploadFile(auth, message);
          });
        });
      }
      if (utils.isInclude([MESSAGE_TYPE.FILE, MESSAGE_TYPE.VOICE], name)) {
        uploadFile(auth, message);
      }
    });
    function uploadFile(option, message) {
      let {
        content
      } = message;
      let cbs = {
        onprogress: ({
          percent
        }) => {
          _callbacks.onprogress({
            percent,
            message
          });
        },
        oncompleted: ({
          url
        }) => {
          if (!utils.isInclude([MESSAGE_TYPE.VOICE], name)) {
            let _size = content.size || content.file.size;
            let size = _size / 1024;
            utils.extend(message.content, {
              size: size.toFixed(2)
            });
          }
          utils.extend(message.content, {
            url
          });
          delete message.content.file;
          _callbacks.oncompleted(message);
        },
        onerror: error => {
          _callbacks.onerror(ErrorType.UPLOADING_FILE_ERROR, error);
        }
      };
      uploader.exec(content, option, cbs);
    }
  };
  /* 
    message = {
      conversationType,
      conversationId,
      content: { file, name, type, intro }
    }
  */
  let sendFileMessage = (message, callbacks = {}) => {
    message = utils.extend(message, {
      name: MESSAGE_TYPE.FILE
    });
    let option = {
      fileType: FILE_TYPE.FILE
    };
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SEND_FILE_MESSAGE, true);
      let {
        uploadType
      } = io.getConfig();
      if (utils.isEqual(uploadType, UPLOAD_TYPE.NONE)) {
        error = ErrorType.UPLOAD_PLUGIN_ERROR;
      }
      if (!utils.isEmpty(error)) {
        return reject({
          error
        });
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND_FILE,
        type: FILE_TYPE.FILE
      });
      let onbefore = callbacks.onbefore || utils.noop;
      let tid = message.tid || utils.getUUID();
      utils.extend(message, {
        tid,
        sentState: MESSAGE_SENT_STATE.SENDING
      });
      let {
        size = 0
      } = message.content;
      size = size / 1024;
      let msg = utils.clone(message);
      msg.content = {
        ...message.content,
        size
      };
      onbefore(msg);
      if (!io.isConnected()) {
        return reject({
          tid,
          sentState: MESSAGE_SENT_STATE.FAILED,
          error: ErrorType.CONNECTION_NOT_READY
        });
      }
      _uploadFile(option, message, {
        onprogress: callbacks.onprogress,
        oncompleted: message => {
          delete message.content.tempPath;
          sendMessage(message).then(resolve, reject);
        },
        onerror: error => {
          if (utils.isEqual(error.code, ErrorType.COMMAND_FAILED.code)) {
            return reject({
              tid,
              sentState: MESSAGE_SENT_STATE.FAILED,
              error: ErrorType.COMMAND_FAILED
            });
          }
          callbacks.onerror(error, message);
        }
      });
    });
  };
  let sendImageMessage = (message, callbacks = {}) => {
    message = utils.extend(message, {
      name: MESSAGE_TYPE.IMAGE
    });
    let option = {
      fileType: FILE_TYPE.IMAGE,
      scale: message.scale
    };
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SEND_FILE_MESSAGE, true);
      let {
        uploadType
      } = io.getConfig();
      if (utils.isEqual(uploadType, UPLOAD_TYPE.NONE)) {
        error = ErrorType.UPLOAD_PLUGIN_ERROR;
      }
      if (!utils.isEmpty(error)) {
        return reject({
          error
        });
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND_FILE,
        type: FILE_TYPE.IMAGE
      });
      let onbefore = callbacks.onbefore || utils.noop;
      let tid = message.tid || utils.getUUID();
      utils.extend(message, {
        tid,
        sentState: MESSAGE_SENT_STATE.SENDING
      });
      onbefore(message);
      if (!io.isConnected()) {
        return reject({
          tid,
          sentState: MESSAGE_SENT_STATE.FAILED,
          error: ErrorType.CONNECTION_NOT_READY
        });
      }
      _uploadFile(option, message, {
        onprogress: callbacks.onprogress,
        oncompleted: message => {
          delete message.content.tempPath;
          sendMessage(message).then(resolve, reject);
        },
        onerror: error => {
          if (utils.isEqual(error.code, ErrorType.COMMAND_FAILED.code)) {
            return reject({
              tid,
              sentState: MESSAGE_SENT_STATE.FAILED,
              error: ErrorType.COMMAND_FAILED
            });
          }
          callbacks.onerror(error, message);
        }
      });
    });
  };
  let sendVoiceMessage = (message, callbacks = {}) => {
    message = utils.extend(message, {
      name: MESSAGE_TYPE.VOICE
    });
    let option = {
      fileType: FILE_TYPE.AUDIO
    };
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SEND_FILE_MESSAGE, true);
      let {
        uploadType
      } = io.getConfig();
      if (utils.isEqual(uploadType, UPLOAD_TYPE.NONE)) {
        error = ErrorType.UPLOAD_PLUGIN_ERROR;
      }
      if (!utils.isEmpty(error)) {
        return reject({
          error
        });
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND_FILE,
        type: FILE_TYPE.AUDIO
      });
      let onbefore = callbacks.onbefore || utils.noop;
      let tid = message.tid || utils.getUUID();
      utils.extend(message, {
        tid,
        sentState: MESSAGE_SENT_STATE.SENDING
      });
      onbefore(message);
      if (!io.isConnected()) {
        return reject({
          tid,
          sentState: MESSAGE_SENT_STATE.FAILED,
          error: ErrorType.CONNECTION_NOT_READY
        });
      }
      _uploadFile(option, message, {
        onprogress: callbacks.onprogress,
        oncompleted: message => {
          delete message.content.tempPath;
          sendMessage(message).then(resolve, reject);
        },
        onerror: error => {
          if (utils.isEqual(error.code, ErrorType.COMMAND_FAILED.code)) {
            return reject({
              tid,
              sentState: MESSAGE_SENT_STATE.FAILED,
              error: ErrorType.COMMAND_FAILED
            });
          }
          callbacks.onerror(error, message);
        }
      });
    });
  };
  let sendVideoMessage = (message, callbacks = {}) => {
    message = utils.extend(message, {
      name: MESSAGE_TYPE.VIDEO
    });
    let option = {
      fileType: FILE_TYPE.VIDEO,
      scale: message.scale
    };
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SEND_FILE_MESSAGE, true);
      let {
        uploadType
      } = io.getConfig();
      if (utils.isEqual(uploadType, UPLOAD_TYPE.NONE)) {
        error = ErrorType.UPLOAD_PLUGIN_ERROR;
      }
      if (!utils.isEmpty(error)) {
        return reject({
          error
        });
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND_FILE,
        type: FILE_TYPE.VIDEO
      });
      let onbefore = callbacks.onbefore || utils.noop;
      let tid = message.tid || utils.getUUID();
      utils.extend(message, {
        tid,
        sentState: MESSAGE_SENT_STATE.SENDING
      });
      onbefore(message);
      if (!io.isConnected()) {
        return reject({
          tid,
          sentState: MESSAGE_SENT_STATE.FAILED,
          error: ErrorType.CONNECTION_NOT_READY
        });
      }
      _uploadFile(option, message, {
        onprogress: callbacks.onprogress,
        oncompleted: message => {
          delete message.content.tempPath;
          sendMessage(message).then(resolve, reject);
        },
        onerror: error => {
          if (utils.isEqual(error.code, ErrorType.COMMAND_FAILED.code)) {
            return reject({
              tid,
              sentState: MESSAGE_SENT_STATE.FAILED,
              error: ErrorType.COMMAND_FAILED
            });
          }
          callbacks.onerror(error, message);
        }
      });
    });
  };
  let sendMergeMessage = (params, callbacks = {}) => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.SEND_MERGE_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject({
          error
        });
      }
      logger.info({
        tag: LOG_MODULE.MSG_SEND_MERGE
      });
      let {
        conversationType,
        conversationId,
        messages,
        previewList,
        title
      } = params;
      if (messages.length > 20) {
        return reject({
          error: ErrorType.TRANSFER_MESSAGE_COUNT_EXCEED
        });
      }
      let mergeMsg = {
        channelType: CONVERATION_TYPE.PRIVATE,
        targetId: ''
      };
      let messageIdList = [];
      messages = utils.map(messages, message => {
        utils.extend(mergeMsg, {
          channelType: message.conversationType,
          targetId: message.conversationId
        });
        return {
          msgId: message.messageId,
          msgTime: message.sentTime,
          msgIndex: message.messageIndex
        };
      });
      utils.forEach(messages, ({
        msgId
      }) => {
        messageIdList.push(msgId);
      });
      let user = io.getCurrentUser();
      utils.extend(mergeMsg, {
        userId: user.id,
        msgs: messages
      });
      let msg = {
        conversationId,
        conversationType,
        name: MESSAGE_TYPE.MERGE,
        mergeMsg: mergeMsg,
        content: {
          previewList,
          messageIdList,
          title
        }
      };
      return sendMessage(msg, callbacks).then(resolve, reject);
    });
  };
  let getMergeMessages = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.GET_MERGE_MESSAGES);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let data = {
        time: 0,
        order: MESSAGE_ORDER.FORWARD,
        count: 20,
        topic: COMMAND_TOPICS.GET_MERGE_MSGS
      };
      utils.extend(data, params);
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          isFinished,
          messages
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve({
          isFinished,
          messages
        });
      });
    });
  };
  let getFirstUnreadMessage = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GET_FIRST_UNREAD_MSG);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let data = {
        ...conversation,
        topic: COMMAND_TOPICS.GET_FIRST_UNREAD_MSG
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code,
        msg
      }) => {
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          let error = common.getError(code);
          return reject(error);
        }
        resolve({
          message: msg
        });
      });
    });
  };
  let searchMessages = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.SEARCH_MESSAGES);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      return reject(ErrorType.SDK_FUNC_NOT_DEFINED);
    });
  };
  let updateMessageAttr = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.UPDATE_MESSAGE_ATTR);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      return reject(ErrorType.SDK_FUNC_NOT_DEFINED);
    });
  };
  let setSearchContent = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SET_MESSAGE_SEARCH_CONTENT);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      return reject(ErrorType.SDK_FUNC_NOT_DEFINED);
    });
  };
  let insertMessage = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.INSERT_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let user = io.getCurrentUser();
      let {
        sender
      } = message;
      let isSender = utils.isEqual(user.id, sender.id);
      let tid = utils.getUUID();
      let msg = {
        tid,
        ...message,
        isSender,
        sender
      };
      resolve(msg);
    });
  };
  let addMessageReaction = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.ADD_MSG_REACTION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.ADD_MSG_REACTION,
        ...message,
        userId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          timestamp
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        common.updateSyncTime({
          isSender: true,
          sentTime: timestamp,
          io
        });
        resolve();
      });
    });
  };
  let removeMessageReaction = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.REMOVE_MSG_REACTION);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id: userId
      } = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.REMOVE_MSG_REACTION,
        ...message,
        userId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          timestamp
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        common.updateSyncTime({
          isSender: true,
          sentTime: timestamp,
          io
        });
        resolve();
      });
    });
  };

  /* 
    let params = {
      targetLang: '',
      sourceLang: '',
      content: {
        key1: content,
        key2: content2
      }
    }
  */
  let translate = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.TRANSLATE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        content
      } = params;
      if (utils.isEmpty(content)) {
        return resolve(params);
      }
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.BATCH_TRANSLATE,
        ...params,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          trans
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        let {
          items
        } = trans;
        let _result = {};
        utils.forEach(items, item => {
          let {
            key,
            content
          } = item;
          _result[key] = content;
        });
        resolve(_result);
      });
    });
  };

  /* 
     let subscribeMsgCache = {
      conversationType_convesationId: { 
        timer: '定时器',
        time: '上一次的获取时间'
      }
    }
  */
  let subscribeMsgCache = {};
  let _getSubId = conversation => {
    let {
      conversationId,
      conversationType
    } = conversation;
    return `${conversationType}_${conversationId}`;
  };
  let subscribeMessage = (conversation, option) => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.SUBSCRIBE_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let subId = _getSubId(conversation);
      let subInfo = subscribeMsgCache[subId];
      if (subInfo) {
        return resolve();
      }
      subInfo = {
        timer: 0,
        time: 0
      };
      subscribeMsgCache[subId] = subInfo;
      let defOption = {
        ms: 3 * 1000
      };
      if (!utils.isObject(option) || !utils.isNumber(option.ms)) {
        option = defOption;
      }
      let fetchMsgs = params => {
        getMessages(params).then(result => {
          let {
            messages
          } = result;
          messages = messages || [];
          let message = messages[messages.length - 1];
          if (message) {
            subInfo.time = message.sentTime;
          }
          utils.forEach(messages, message => {
            io.emit(SIGNAL_NAME.CMD_RECEIVED, message);
          });
        }).catch(utils.noop);
      };
      let firstParams = {
        ...conversation,
        time: 0
      };
      fetchMsgs(firstParams);
      subInfo.timer = setInterval(() => {
        let params = {
          ...conversation,
          time: subInfo.time,
          count: 200,
          order: MESSAGE_ORDER.FORWARD
        };
        fetchMsgs(params);
      }, option.ms);
    });
  };
  let unsubscribeMessage = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.SUBSCRIBE_MESSAGE, true);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let subId = _getSubId(conversation);
      let subInfo = subscribeMsgCache[subId];
      if (subInfo) {
        clearInterval(subInfo.timer);
        delete subscribeMsgCache[subId];
      }
      resolve();
    });
  };

  /* 
    let message = {
      conversationType: 1,
      conversationId: '',
      messageId: '',
      isTop: true,
    }
  */
  let setTopMessage = message => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, message, FUNC_PARAM_CHECKER.SET_TOP_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        isTop,
        conversationType,
        conversationId,
        messageId
      } = message;
      let user = io.getCurrentUser();
      let topic = isTop ? COMMAND_TOPICS.SET_TOP_MSG : COMMAND_TOPICS.DEL_TOP_MSG;
      let data = {
        topic: topic,
        conversationType,
        conversationId,
        messageId,
        userId: user.id,
        isTop: !!isTop
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        let _msg = {
          conversationType,
          conversationId,
          content: {
            msg_id: messageId,
            action: isTop ? MSG_TOP_ACTION_TYPE.ADD : MSG_TOP_ACTION_TYPE.REMOVE
          },
          sender: user,
          name: MESSAGE_TYPE.COMMAND_MSG_SET_TOP,
          sentTime: Date.now()
        };
        commandNotify(_msg);
        resolve();
      });
    });
  };

  /* 
    let conversation = {
      conversationType: 1,
      conversationId: '',
    }
  */
  let getTopMessage = conversation => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, conversation, FUNC_PARAM_CHECKER.GET_TOP_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        conversationType,
        conversationId
      } = conversation;
      let data = {
        topic: COMMAND_TOPICS.GET_TOP_MSG,
        conversationType,
        conversationId
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          message,
          operator,
          createdTime
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        let _result = {};
        if (message) {
          _result = {
            message,
            operator,
            createdTime
          };
        }
        resolve(_result);
      });
    });
  };
  let addFavoriteMessages = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.ADD_FAVORITE_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        messages
      } = params;
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.MSG_ADD_FAVORITE,
        messages,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve();
      });
    });
  };
  let removeFavoriteMessages = params => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, params, FUNC_PARAM_CHECKER.ADD_FAVORITE_MESSAGE);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        messages
      } = params;
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.MSG_REMOVE_FAVORITE,
        messages,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve();
      });
    });
  };
  let getFavoriteMessages = params => {
    return utils.deferred((resolve, reject) => {
      let _params = {
        limit: 20,
        offset: ''
      };
      if (!utils.isObject(params)) {
        params = _params;
      }
      let {
        limit = 20,
        offset = ''
      } = params;
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.MSG_QRY_FAVORITE,
        limit,
        offset,
        userId: user.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          msg,
          list,
          offset
        } = result;
        if (!utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return reject({
            code,
            msg
          });
        }
        resolve({
          list,
          offset
        });
      });
    });
  };
  return {
    sendMessage,
    sendMassMessage,
    getMessages,
    removeMessages,
    getMessagesByIds,
    clearMessage,
    recallMessage,
    readMessage,
    getMessageReadDetails,
    updateMessage,
    insertMessage,
    updateMessageAttr,
    setSearchContent,
    getMentionMessages,
    getFileToken,
    sendFileMessage,
    sendImageMessage,
    sendVoiceMessage,
    sendVideoMessage,
    sendMergeMessage,
    getMergeMessages,
    getFirstUnreadMessage,
    searchMessages,
    addMessageReaction,
    removeMessageReaction,
    subscribeMessage,
    unsubscribeMessage,
    translate,
    setTopMessage,
    getTopMessage,
    addFavoriteMessages,
    removeFavoriteMessages,
    getFavoriteMessages,
    _uploadFile
  };
}

function Socket$1 (io, emitter, logger) {
  CONNECT_STATE.DISCONNECTED;
  io.on(SIGNAL_NAME.CONN_CHANGED, data => {
    let {
      state,
      code = '',
      user = {}
    } = data;
    logger.info({
      tag: LOG_MODULE.CON_STATUS,
      state,
      code,
      userId: user.id
    });
    emitter.emit(EVENT.STATE_CHANGED, data);
  });
  let connect = user => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, user, FUNC_PARAM_CHECKER.CONNECT, true);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        token = ''
      } = user;
      token = token.trim();
      user = utils.extend(user, {
        token
      });
      if (!io.isNeedConnect()) {
        return reject(ErrorType.REPREAT_CONNECTION);
      }
      logger.info({
        tag: LOG_MODULE.CON_CONNECT
      });
      io.connect(user, ({
        error,
        user,
        next
      }) => {
        let {
          code,
          msg
        } = error;
        if (utils.isEqual(code, ErrorType.CONNECT_SUCCESS.code)) {
          let config = io.getConfig();
          if (!config.isPC) {
            next();
            return resolve(user);
          }
          utils.extend(user, {
            code,
            next
          });
          return resolve(user);
        }
        reject({
          code,
          msg
        });
      });
    });
  };
  let disconnect = () => {
    return utils.deferred(resolve => {
      logger.info({
        tag: LOG_MODULE.CON_DISCONNECT
      });
      io.disconnect();
      let config = io.getConfig();
      if (!config.isPC) {
        io.emit(SIGNAL_NAME.CLIENT_CLEAR_MEMORY_CACHE, {});
      }
      resolve();
    });
  };
  let getDevice = () => {
    return utils.deferred((resolve, reject) => {
      return reject(ErrorType.SDK_FUNC_NOT_DEFINED);
    });
  };
  let setServerUrlProider = callback => {
    if (!utils.isFunction(callback)) {
      callback = utils.noop;
    }
    io.setServerUrlProider(callback);
  };
  return {
    connect,
    disconnect,
    setServerUrlProider,
    getDevice: getDevice,
    isNeedConnect: io.isNeedConnect,
    isConnected: io.isConnected,
    getCurrentUser: io.getCurrentUser
  };
}

let cacher = Cache();
let heap = ({
  chatroomId,
  attrs
}) => {
  let dels = [],
    updates = [];
  let {
    attrs: list
  } = cacher.get(chatroomId);
  list = list || [];
  utils.forEach(attrs, attr => {
    let {
      key,
      value,
      updateTime,
      userId,
      type
    } = attr;
    let _attr = {
      key,
      value,
      updateTime,
      userId
    };
    let index = utils.find(list, item => {
      return utils.isEqual(item.key, key);
    });
    if (utils.isEqual(index, -1) && utils.isEqual(type, CHATROOM_ATTR_OP_TYPE.ADD)) {
      list.push(_attr);
    }
    if (!utils.isEqual(index, -1) && utils.isEqual(type, CHATROOM_ATTR_OP_TYPE.ADD)) {
      list.splice(index, 1, _attr);
    }
    if (utils.isEqual(type, CHATROOM_ATTR_OP_TYPE.DEL)) {
      list.splice(index, 1);
      delete _attr.value;
      dels.push(_attr);
    } else {
      updates.push(_attr);
    }
  });
  cacher.set(chatroomId, {
    attrs: list
  });
  return {
    updates,
    dels
  };
};
let removeAll = chatroomId => {
  cacher.remove(chatroomId);
};
let getAll = chatroom => {
  let {
    id
  } = chatroom;
  let result = cacher.get(id);
  let {
    attrs = []
  } = result;
  return {
    id,
    attributes: attrs
  };
};
let removeAttrs = chatroom => {
  let {
    id,
    attributes
  } = chatroom;
  let attrs = utils.map(attributes, attr => {
    return {
      ...attr,
      type: CHATROOM_ATTR_OP_TYPE.DEL
    };
  });
  heap({
    chatroomId: id,
    attrs
  });
};
let getAttrs = chatroom => {
  let {
    id,
    attributes
  } = chatroom;
  let {
    attrs = []
  } = cacher.get(id);
  let list = [];
  utils.forEach(attrs, attr => {
    utils.forEach(attributes, item => {
      if (utils.isEqual(item.key, attr.key)) {
        list.push(attr);
      }
    });
  });
  return {
    id,
    attributes: list
  };
};
var attrCaher = {
  heap,
  removeAll,
  getAll,
  getAttrs,
  removeAttrs
};

function Chatroom$1 (io, emitter, logger) {
  // 聊天室全以 Web 通信为主，PC 端只做接口透传，所以未在 desktop/index.js init 方法中卸载 io 相关事件，直接在 Web 端复用 
  io.on(SIGNAL_NAME.CMD_CHATROOM_ATTR_RECEIVED, result => {
    logger.info({
      tag: LOG_MODULE.CHATROOM_ATTR_RECEIVE,
      ...result
    });
    let {
      dels,
      updates
    } = attrCaher.heap(result);
    let {
      chatroomId
    } = result;
    if (!utils.isEmpty(dels)) {
      emitter.emit(EVENT.CHATROOM_ATTRIBUTE_DELETED, {
        id: chatroomId,
        attributes: dels
      });
    }
    if (!utils.isEmpty(updates)) {
      emitter.emit(EVENT.CHATROOM_ATTRIBUTE_UPDATED, {
        id: chatroomId,
        attributes: updates
      });
    }
  });
  io.on(SIGNAL_NAME.CMD_CHATROOM_DESTROY, chatroom => {
    logger.info({
      tag: LOG_MODULE.CHATROOM_DESTORYED,
      ...chatroom
    });
    emitter.emit(EVENT.CHATROOM_DESTROYED, chatroom);
  });
  io.on(SIGNAL_NAME.CMD_CHATROOM_EVENT, notify => {
    let {
      type,
      chatroomId
    } = notify;
    logger.info({
      tag: LOG_MODULE.CHATROOM_SERVER_EVENT,
      ...notify
    });
    if (utils.isEqual(CHATROOM_EVENT_TYPE.FALLOUT, type) || utils.isEqual(CHATROOM_EVENT_TYPE.QUIT, type)) {
      clearChatroomCache(chatroomId);
      emitter.emit(EVENT.CHATROOM_USER_QUIT, notify);
    }
    if (utils.isEqual(CHATROOM_EVENT_TYPE.KICK, type)) {
      clearChatroomCache(chatroomId);
      emitter.emit(EVENT.CHATROOM_USER_KICKED, notify);
    }
  });

  // 和 desktop/chatroom.js 复用断网重复加入事件，由于不涉及对外暴露 emitter，SDK 所以内部可共享 io.emit 事件
  io.on(SIGNAL_NAME.CMD_CHATROOM_REJOIN, () => {
    let chatrooms = chatroomCacher$1.getAll();
    let chatroomIds = [];
    utils.forEach(chatrooms, (value, chatroomId) => {
      chatroomIds.push(chatroomId);
    });
    logger.info({
      tag: LOG_MODULE.CHATROOM_USER_REJOIN,
      chatroomIds
    });
    utils.iterator(chatroomIds, (id, next, isFinished) => {
      let chatroom = {
        id
      };
      let _next = () => {
        if (!isFinished) {
          next();
        }
      };
      _joinChatroom(chatroom, {
        success: _next,
        fail: _next
      });
    });
  });
  function clearChatroomCache(chatroomId) {
    chatroomCacher$1.remove(chatroomId);
    attrCaher.removeAll(chatroomId);
  }
  let joinChatroom = chatroom => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.JOINCHATROOM);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id
      } = chatroom;
      let chatroomResult = chatroomCacher$1.get(id);
      if (chatroomResult.isJoined) {
        return resolve();
      }
      let _chatroom = {
        ...utils.clone(chatroom),
        isAutoCreate: false
      };
      logger.info({
        tag: LOG_MODULE.CHATROOM_USER_JOIN,
        ..._chatroom
      });
      _joinChatroom(_chatroom, {
        success: resolve,
        fail: reject
      });
    });
  };
  function joinAndCreateChatroom(chatroom) {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.JOINCHATROOM);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        id
      } = chatroom;
      let chatroomResult = chatroomCacher$1.get(id);
      if (chatroomResult.isJoined) {
        return resolve();
      }
      let _chatroom = {
        ...utils.clone(chatroom),
        isAutoCreate: true
      };
      logger.info({
        tag: LOG_MODULE.CHATROOM_USER_JOIN,
        ..._chatroom
      });
      _joinChatroom(_chatroom, {
        success: resolve,
        fail: reject
      });
    });
  }
  function _joinChatroom(chatroom, callbacks) {
    let {
      id
    } = chatroom;
    let data = {
      topic: COMMAND_TOPICS.JOIN_CHATROOM,
      chatroom,
      conversationId: id
    };
    let count = chatroom.count;
    if (utils.isUndefined(count)) {
      count = 50;
    }
    io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
      let {
        code,
        timestamp
      } = result;
      logger.info({
        tag: LOG_MODULE.CHATROOM_USER_JOIN,
        ...chatroom,
        code
      });
      if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
        let chatroomResult = chatroomCacher$1.get(chatroom.id);
        let syncMsgTime = chatroomResult.syncMsgTime || 0;
        let isNotSync = utils.isEqual(0, count);
        let _time = syncMsgTime;
        if (isNotSync && utils.isEqual(syncMsgTime, 0)) {
          _time = timestamp;
        }
        let syncers = [{
          name: SIGNAL_NAME.S_NTF,
          msg: {
            receiveTime: _time,
            isNotSync,
            count: count,
            type: NOTIFY_TYPE.CHATROOM,
            targetId: id
          }
        }, {
          name: SIGNAL_NAME.S_NTF,
          msg: {
            receiveTime: 0,
            type: NOTIFY_TYPE.CHATROOM_ATTR,
            targetId: id
          }
        }];
        chatroomCacher$1.set(chatroom.id, {
          isJoined: true
        });
        io.sync(syncers);
        return callbacks.success();
      }
      let error = common.getError(code);
      callbacks.fail(error);
    });
  }
  let quitChatroom = chatroom => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.QUITCHATROOM);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let chatroomResult = chatroomCacher$1.get(chatroom.id);
      if (!chatroomResult.isJoined) {
        return resolve();
      }
      logger.info({
        tag: LOG_MODULE.CHATROOM_USER_QUIT,
        ...chatroom
      });
      let data = {
        topic: COMMAND_TOPICS.QUIT_CHATROOM,
        chatroom
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, ({
        code
      }) => {
        logger.info({
          tag: LOG_MODULE.CHATROOM_USER_QUIT,
          ...chatroom,
          code
        });
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          clearChatroomCache(chatroom.id);
          return resolve();
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* 
    let chatroom = {
      id: 'chatroomId',
      attributes: [
        { key: 'name', value: 'xiaoshan', isForce: true, isAutoDel: true },
      ],
      options: {
        notify: '',
      }
    }
  */
  let setChatroomAttributes = chatroom => {
    chatroom = utils.clone(chatroom);
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.SET_CHATROOM_ATTRS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        options
      } = chatroom;
      if (!utils.isObject(options)) {
        options = {};
      }
      let {
        notify
      } = options;
      if (!utils.isUndefined(notify) && !utils.isString(notify)) {
        let _error = ErrorType.ILLEGAL_TYPE_PARAMS;
        return reject({
          code: _error.code,
          msg: `notify ${_error.msg}，必须是 String 类型`
        });
      }
      chatroom = utils.extend(chatroom, {
        options
      });
      let data = {
        topic: COMMAND_TOPICS.SET_CHATROOM_ATTRIBUTES,
        chatroom
      };
      attrCaher.removeAttrs(chatroom);
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          success,
          fail
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve({
            success,
            fail
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* 
   let chatroom = {
     id: 'chatroomId',
     attributes: [{ key: 'key1' }],
     options: {
       notify: ''
     }
   };
  */
  let removeChatroomAttributes = chatroom => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.REMOVE_CHATROOM_ATTRS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let {
        options
      } = chatroom;
      if (!utils.isObject(options)) {
        options = {};
      }
      let {
        notify
      } = options;
      if (!utils.isUndefined(notify) && !utils.isString(notify)) {
        let _error = ErrorType.ILLEGAL_TYPE_PARAMS;
        return reject({
          code: _error.code,
          msg: `notify ${_error.msg}，必须是 String 类型`
        });
      }
      chatroom = utils.extend(chatroom, {
        options
      });
      let data = {
        topic: COMMAND_TOPICS.REMOVE_CHATROOM_ATTRIBUTES,
        chatroom
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          success,
          fail
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          attrCaher.removeAttrs({
            id: chatroom.id,
            attributes: success
          });
          return resolve({
            success,
            fail
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* 
    let chatroom = {
      id: 'chatroomId',
      attributes: [{ key: 'key1' }],
    };
  */
  let getChatroomAttributes = chatroom => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.GET_CHATROOM_ATTRS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let result = attrCaher.getAttrs(chatroom);
      resolve(result);
    });
  };
  /* 
  let chatroom = {
    id: 'chatroomId',
  };
  */
  let getAllChatRoomAttributes = chatroom => {
    return utils.deferred((resolve, reject) => {
      let error = common.check(io, chatroom, FUNC_PARAM_CHECKER.GET_ALL_CHATROOM_ATTRS);
      if (!utils.isEmpty(error)) {
        return reject(error);
      }
      let result = attrCaher.getAll(chatroom);
      resolve(result);
    });
  };
  return {
    joinChatroom,
    joinAndCreateChatroom,
    quitChatroom,
    setChatroomAttributes,
    getChatroomAttributes,
    removeChatroomAttributes,
    getAllChatRoomAttributes
  };
}

let init$2 = ({
  io,
  emitter,
  logger
}) => {
  let socket = Socket$1(io, emitter, logger);
  let conversation = Conversation$1(io, emitter);
  let message = Message$1(io, emitter, logger);
  let chatroom = Chatroom$1(io, emitter, logger);
  io.setConfig({
    logger: logger,
    $message: {
      insertBatchMsgs: params => {
        return Promise.resolve();
      }
    }
  });
  return {
    socket,
    conversation,
    message,
    chatroom
  };
};
var Web = {
  init: init$2
};

function Conversation ($conversation, {
  conversationUtils,
  webAgent
}) {
  let funcs = ['removeConversation', 'clearUnreadcount', 'getTotalUnreadcount', 'clearTotalUnreadcount', 'markUnread', 'setDraft', 'getDraft', 'removeDraft', 'insertConversation', 'disturbConversation', 'setTopConversation', 'getTopConversations', 'setAllDisturb', 'getAllDisturb', 'getAllDisturb', 'createConversationTag', 'destroyConversationTag', 'getConversationTags', 'addConversationsToTag', 'removeConversationsFromTag', '_batchInsertConversations'];
  let invokes = common.formatProvider(funcs, $conversation);
  invokes.getConversations = (params = {}) => {
    return $conversation.getConversations(params).then(({
      conversations,
      groups,
      users,
      isFinished
    }) => {
      let _conversations = tools.formatConversations({
        conversations,
        users,
        groups
      });
      // 不指定会话类型时向内存中插入数据
      if (utils.isUndefined(params.conversationType)) {
        conversationUtils.add(_conversations);
      }
      return {
        isFinished,
        conversations: utils.clone(_conversations)
      };
    });
  };
  invokes.getConversation = conversation => {
    return $conversation.getConversation(conversation).then(result => {
      let {
        conversation,
        groups,
        users
      } = result;
      let _conversation = {};
      if (!conversation.isNew) {
        _conversation = tools.formatConversation({
          conversation,
          users,
          groups
        });
      }
      return {
        conversation: _conversation
      };
    });
  };
  return invokes;
}

function Message ($message, {
  webAgent
}) {
  let funcs = ['sendMessage', 'updateMessageAttr', 'removeMessages', 'sendMassMessage', 'getMessagesByIds', 'clearMessage', 'recallMessage', 'readMessage', 'getMessageReadDetails', 'updateMessage', 'insertMessage', 'getMentionMessages', 'getFileToken', 'sendFileMessage', 'sendImageMessage', 'sendVoiceMessage', 'sendVideoMessage', 'sendMergeMessage', 'getMergeMessages', 'setSearchContent', 'addMessageReaction', 'removeMessageReaction', 'getFirstUnreadMessage'];
  let invokes = common.formatProvider(funcs, $message);
  invokes.subscribeMessage = conversation => {
    return webAgent.subscribeMessage(conversation);
  };
  invokes.unsubscribeMessage = conversation => {
    return webAgent.unsubscribeMessage(conversation);
  };
  invokes.translate = params => {
    return webAgent.translate(params);
  };
  invokes.setTopMessage = params => {
    return webAgent.setTopMessage(params);
  };
  invokes.getTopMessage = params => {
    return webAgent.getTopMessage(params);
  };
  invokes.addFavoriteMessages = params => {
    return webAgent.addFavoriteMessages(params);
  };
  invokes.removeFavoriteMessages = params => {
    return webAgent.removeFavoriteMessages(params);
  };
  invokes.getFavoriteMessages = params => {
    return webAgent.getFavoriteMessages(params);
  };
  invokes.getMessages = conversation => {
    return utils.deferred((resolve, reject) => {
      let {
        order = MESSAGE_ORDER.BACKWARD
      } = conversation;
      let params = {
        time: conversation.time || 0,
        order: order,
        count: conversation.count || 20,
        names: conversation.names || [],
        conversationType: conversation.conversationType,
        conversationId: conversation.conversationId
      };
      return $message.getMessages(params).then(({
        messages = [],
        isFinished,
        groups,
        senders
      }) => {
        let list = utils.filter(messages, msg => {
          return utils.isEqual(msg.sentState, MESSAGE_SENT_STATE.SUCCESS);
        });
        let next = () => {
          let _msgs = tools.formatMsgs({
            messages,
            senders,
            groups
          });
          resolve({
            isFinished,
            messages: _msgs
          });
        };
        let isCon = utils.isContinuous(list, 'messageIndex');
        let len = messages.length;
        let isFetch = isFinished && params.count > len;
        let isUncomleted = tools.hasUncompletedStream(list);
        // 如果首次获取历史消息，从远端拉取历史消息
        if (isFetch || !isCon || utils.isEqual(params.time, 0) || isUncomleted) {
          // 按类型获取历史消息，不再从远端获取，方式 index 断续
          if (!utils.isEmpty(params.names)) {
            return next();
          }
          return webAgent.getMessages(conversation).then(result => {
            let newMsgs = [],
              streamMsgs = [];
            utils.forEach(result.messages, newMsg => {
              let index = utils.find(messages, msg => {
                return utils.isEqual(msg.messageId, newMsg.messageId);
              });
              let _msg = messages[index];
              if (!_msg) {
                newMsgs.push(newMsg);
              }
              let {
                streams
              } = newMsg;
              if (_msg) {
                let _streams = _msg.streams || [];
                if (streams.length > _streams.length) {
                  streamMsgs.push(newMsg);
                }
              }
            });
            $message.insertBatchMsgs({
              msgs: utils.clone(newMsgs.concat(streamMsgs))
            });
            let _msgs = tools.formatMsgs({
              messages: messages,
              senders,
              groups
            });
            let list = newMsgs.concat(_msgs);
            utils.forEach(streamMsgs, streamMsg => {
              let {
                messageId,
                streams
              } = streamMsg;
              let index = utils.find(list, item => {
                return utils.isEqual(item.messageId, messageId);
              });
              if (index > -1) {
                utils.extend(list[index], {
                  streams
                });
              }
            });
            list = utils.quickSort(list, (a, b) => {
              return a.sentTime < b.sentTime;
            });
            resolve({
              isFinished: result.isFinished,
              messages: list
            });
          }, reject);
        }
        next();
      });
    });
  };
  invokes.searchMessages = params => {
    return $message.searchMessages(params).then(result => {
      let {
        total,
        list,
        groups,
        senders,
        isFinished
      } = result;
      list = utils.map(list, item => {
        let {
          matchedList,
          matchedCount,
          conversationType,
          conversationId
        } = item;
        let _msgs = tools.formatMsgs({
          messages: matchedList,
          senders,
          groups
        });
        let params = {
          conversation: {
            id: conversationId,
            type: conversationType
          },
          users: senders,
          groups
        };
        let _conversation = tools.formatConversation(params);
        let {
          conversationTitle,
          conversationPortrait,
          conversationExts
        } = _conversation;
        return {
          matchedList: _msgs,
          matchedCount,
          conversationType,
          conversationId,
          conversationTitle,
          conversationPortrait,
          conversationExts
        };
      });
      return {
        total,
        list,
        isFinished
      };
    });
  };
  return invokes;
}

function Socket ($socket, {
  webAgent
}) {
  let funcs = ['connect', 'disconnect', 'getDevice', 'isConnected', 'isNeedConnect', 'getCurrentUser'];
  let invokes = common.formatProvider(funcs, $socket);
  invokes.setServerUrlProider = callback => {
    webAgent.setServerUrlProider(callback);
  };
  return invokes;
}

function Chatroom ($chatroom, {
  io,
  emitter,
  logger
}) {
  io.on(SIGNAL_NAME.CMD_CHATROOM_ATTR_RECEIVED, result => {
    logger.info({
      tag: LOG_MODULE.CHATROOM_ATTR_RECEIVE,
      ...result
    });
    let {
      dels,
      updates
    } = attrCaher.heap(result);
    let {
      chatroomId
    } = result;
    if (!utils.isEmpty(dels)) {
      emitter.emit(EVENT.CHATROOM_ATTRIBUTE_DELETED, {
        id: chatroomId,
        attributes: dels
      });
    }
    if (!utils.isEmpty(updates)) {
      emitter.emit(EVENT.CHATROOM_ATTRIBUTE_UPDATED, {
        id: chatroomId,
        attributes: updates
      });
    }
  });
  io.on(SIGNAL_NAME.CMD_CHATROOM_DESTROY, chatroom => {
    emitter.emit(EVENT.CHATROOM_DESTROYED, chatroom);
  });
  io.on(SIGNAL_NAME.CMD_CHATROOM_EVENT, notify => {
    let {
      type,
      chatroomId
    } = notify;
    if (utils.isEqual(CHATROOM_EVENT_TYPE.FALLOUT, type) || utils.isEqual(CHATROOM_EVENT_TYPE.QUIT, type)) {
      clearChatroomCache(chatroomId);
      emitter.emit(EVENT.CHATROOM_USER_QUIT, notify);
    }
    if (utils.isEqual(CHATROOM_EVENT_TYPE.KICK, type)) {
      clearChatroomCache(chatroomId);
      emitter.emit(EVENT.CHATROOM_USER_KICKED, notify);
    }
  });
  function clearChatroomCache(chatroomId) {
    chatroomCacher$1.remove(chatroomId);
    attrCaher.removeAll(chatroomId);
  }
  let joinChatroom = chatroom => {
    return $chatroom.joinChatroom(chatroom);
  };
  let joinAndCreateChatroom = chatroom => {
    return $chatroom.joinAndCreateChatroom(chatroom);
  };
  let quitChatroom = chatroom => {
    return $chatroom.quitChatroom(chatroom);
  };
  let setChatroomAttributes = chatroom => {
    return $chatroom.setChatroomAttributes(chatroom);
  };
  let getChatroomAttributes = chatroom => {
    return $chatroom.getChatroomAttributes(chatroom);
  };
  let removeChatroomAttributes = chatroom => {
    return $chatroom.removeChatroomAttributes(chatroom);
  };
  let getAllChatRoomAttributes = chatroom => {
    return $chatroom.getAllChatRoomAttributes(chatroom);
  };
  return {
    joinChatroom,
    quitChatroom,
    joinAndCreateChatroom,
    setChatroomAttributes,
    getChatroomAttributes,
    removeChatroomAttributes,
    getAllChatRoomAttributes
  };
}

let init$1 = ({
  appkey,
  io,
  emitter,
  web,
  client,
  logger
}) => {
  let {
    SIGNAL_NAME
  } = ENUM;
  // 移除 Web 监听
  io.off(SIGNAL_NAME.CMD_CONVERSATION_CHANGED);
  io.off(SIGNAL_NAME.CONN_CHANGED);
  io.off(SIGNAL_NAME.CMD_RECEIVED);
  let conversationUtils = common.ConversationUtils();
  let pc = JGChatPCClient.init(appkey, {
    ...web,
    emitter,
    io,
    ENUM,
    utils,
    common,
    MessageCacher,
    conversationUtils,
    chatroomCacher: chatroomCacher$1,
    tools,
    Storage,
    logger
  });
  let socket = Socket(pc.socket, {
    webAgent: web.socket
  });
  let conversation = Conversation(pc.conversation, {
    webAgent: web.conversation,
    conversationUtils
  });
  let message = Message(pc.message, {
    webAgent: web.message
  });
  let chatroom = Chatroom(web.chatroom, {
    io,
    emitter
  });

  // 告知 IO 模块当前是 PC 端，做特殊处理，例如：同步会话列表
  io.setConfig({
    isPC: true,
    $conversation: pc.conversation,
    $socket: pc.socket,
    $message: pc.message,
    logger: logger
  });
  return {
    socket,
    conversation,
    message,
    chatroom
  };
};
var Desktop = {
  init: init$1
};

function RTCSignal ({
  io,
  emitter,
  logger
}) {
  io.on(SIGNAL_NAME.CMD_RTC_INVITE_EVENT, notify => {
    return emitter.emit(EVENT.RTC_INVITE_EVENT, notify);
  });
  io.on(SIGNAL_NAME.CMD_RTC_ROOM_EVENT, notify => {
    return emitter.emit(EVENT.RTC_ROOM_EVENT, notify);
  });

  /* let room = { type, id, members } */
  let createRTCRoom = room => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.RTC_CREATE_ROOM,
        user: user,
        room
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve({
            room
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* let room = { type, id, members } */
  let joinRTCRoom = room => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.RTC_JOIN_ROOM,
        user: user,
        room
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve({
            room
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* let room = { type, id } */
  let quitRTCRoom = room => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.RTC_QUIT_ROOM,
        user: user,
        room
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve({
            room
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* let options = { roomId } */
  let acceptRTC = options => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.RTC_ACCEPT,
        user: user,
        ...options
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve(result);
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };
  /* let room = { id }*/
  let hangupRTC = room => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.RTC_HANGUP,
        user: user,
        roomId: room.id
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve();
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* let room = { id } */
  let queryRTCRoom = room => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        topic: COMMAND_TOPICS.RTC_QRY_ROOM,
        user: user,
        room
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code,
          room: _room
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve({
            ..._room
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* let room = { id } */
  let pingRTC = room => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        user: user,
        room: room,
        topic: COMMAND_TOPICS.RTC_PING
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve({
            room
          });
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };

  /* let options = { 
    roomId: '',
    roomType: roomType,
    memberIds: memberIds,
    channel: 0,
    rtcMediaType: 1
  */
  let inviteRTC = options => {
    return utils.deferred((resolve, reject) => {
      let user = io.getCurrentUser();
      let data = {
        channel: RTC_CHANNEL.ZEGO,
        ...options,
        topic: COMMAND_TOPICS.RTC_INVITE,
        user: user
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve(result);
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };
  /* 
    let options = {
      roomId: '',
      memberId: '',
      state: CALL_STATE.INCOMMING    
    };
  */
  let updateRTCState = options => {
    return utils.deferred((resolve, reject) => {
      io.getCurrentUser();
      let data = {
        ...options,
        topic: COMMAND_TOPICS.RTC_UPDATE_STATE
      };
      io.sendCommand(SIGNAL_CMD.QUERY, data, result => {
        let {
          code
        } = result;
        if (utils.isEqual(ErrorType.COMMAND_SUCCESS.code, code)) {
          return resolve();
        }
        let error = common.getError(code);
        reject(error);
      });
    });
  };
  return {
    createRTCRoom,
    joinRTCRoom,
    quitRTCRoom,
    queryRTCRoom,
    pingRTC,
    inviteRTC,
    acceptRTC,
    hangupRTC,
    updateRTCState,
    $emitter: emitter,
    isConnected: io.isConnected,
    getCurrentUser: io.getCurrentUser
  };
}

/* 
  let option = {
    name: 'dbname',
    version: 'dbversion',
    tables: [
      {
        name: 'tableName',
        indexs: [{name, value}, {name, value}],
        autoIncrement: true
      }
    ]
  }
*/
function DB$3(option) {
  let {
    name,
    version = 1,
    tables = {}
  } = option;
  let db = {};
  let isInitError = false;
  // 数据库初始化是移步的，如果初始化成功之前有请求，优先缓存，初始化成功后再执行 IO 操作
  let funcs = [];
  let request = window.indexedDB.open(name, version);
  request.onerror = e => {
    console.log('logger database error', e);
    isInitError = true;
  };
  request.onsuccess = e => {
    db = request.result;
    consumer();
  };
  request.onupgradeneeded = e => {
    db = request.result;
    createTables();
  };
  let insert = params => {
    let {
      name,
      record
    } = params;
    if (utils.isUndefined(db.name)) {
      return producer({
        name: 'insert',
        params: [params]
      });
    }
    return utils.deferred((resolve, reject) => {
      let request = db.transaction([name], 'readwrite');
      let store = request.objectStore(name);
      request.onsuccess = function () {
        resolve();
      };
      request.onerror = function (e) {
        reject(e);
      };
      record = utils.clone(record);
      store.add(record);
    });
  };

  /* 
    let params = {
      name: 'tableName',
      index: {
        name: '',
        values: [[], [], false, false]
      }
    };
  */
  let search = (params, callback) => {
    if (utils.isUndefined(db.name)) {
      return producer({
        name: 'search',
        params: [params, callback]
      });
    }
    let {
      name,
      index = {}
    } = params;
    let {
      name: indexName,
      type,
      values = []
    } = index;
    let keyRange = IDBKeyRange[type](...values);
    let transaction = db.transaction([name]);
    let store = transaction.objectStore(name);
    let sIdx = store.index(indexName);
    let request = sIdx.openCursor(keyRange);
    let list = [];
    request.onsuccess = function (event) {
      let cursor = event.target.result;
      if (cursor) {
        list.push(cursor.value);
        cursor.continue();
      } else {
        callback({
          list
        });
      }
    };
    request.onerror = function (event) {
      callback({
        list: []
      }, event);
    };
  };

  /* 
    let params = {
      name: 'tableName',
      index: {
        name: '',
        values: [[], [], false, false]
      }
    };
  */
  let remove = params => {
    if (utils.isUndefined(db.name)) {
      return producer({
        name: 'remove',
        params: [params]
      });
    }
    return utils.deferred((resolve, reject) => {
      let {
        name,
        index
      } = params;
      let transaction = db.transaction([name], 'readwrite');
      let store = transaction.objectStore(name);
      let {
        name: indexName,
        type,
        values = []
      } = index;
      let keyRange = IDBKeyRange[type](...values);
      let sIdx = store.index(indexName);
      let request = sIdx.openCursor(keyRange);
      request.onsuccess = function () {
        var cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = function (e) {
        reject(e);
      };
    });
  };
  let dbTools = {
    insert,
    search,
    remove
  };
  function consumer() {
    utils.forEach(funcs, ({
      name,
      params
    }) => {
      dbTools[name](...params);
    });
    funcs = [];
  }
  // option => { name: 'search',  params: [] }
  function producer(option) {
    if (isInitError) {
      funcs = [];
      return;
    }
    funcs.push(option);
  }
  function createTables() {
    utils.forEach(tables, table => {
      let {
        name,
        autoIncrement = true,
        indexs = []
      } = table;
      if (!db.objectStoreNames.contains(name)) {
        let store = db.createObjectStore(name, {
          autoIncrement
        });
        utils.forEach(indexs, idx => {
          store.createIndex(idx.name, idx.value);
        });
      }
    });
    setTimeout(() => {
      consumer();
    }, 100);
  }
  return dbTools;
}

function DB$2(option) {
  let insert = params => {};
  let search = (params, callback) => {
    callback({
      list: []
    });
  };
  let remove = params => {};
  let dbTools = {
    insert,
    search,
    remove
  };
  return dbTools;
}

let DB = DB$3;
if (common.isUni()) {
  DB = DB$2;
}
var DB$1 = DB;

function Logger(option = {}) {
  let TABLE_NAME = 'LOGS';
  let INDEX = {
    TIME: 'time',
    LEVEL: 'level',
    T_L_GROUP: 'time_level'
  };
  let {
    isConsole = true,
    appkey,
    sessionId,
    getCurrentUser,
    getVersion
  } = option;
  let $db = DB$1({
    name: `_IMIIM_${appkey}`,
    tables: [{
      name: TABLE_NAME,
      indexs: [{
        name: INDEX.TIME,
        value: 'time'
      }, {
        name: INDEX.LEVEL,
        value: 'level'
      }, {
        name: INDEX.T_L_GROUP,
        value: ['time', 'level']
      }]
    }]
  });
  let kickDueLogs = () => {
    let day7 = 7 * 24 * 60 * 60 * 1000;
    let time = Date.now() - day7;
    $db.remove({
      name: TABLE_NAME,
      index: {
        name: INDEX.TIME,
        type: 'upperBound',
        values: [time, false]
      }
    });
  };
  kickDueLogs();
  let write = (level, time, content) => {
    $db.insert({
      name: TABLE_NAME,
      record: {
        sessionId,
        level,
        time,
        content
      }
    });
  };
  let log = (level, content) => {
    let time = Date.now();
    write(level, time, content);
    if (isConsole) {
      let _time = utils.formatTime(time);
      let _content = utils.toJSON(content);
      console.log(`%cJG:LOG`, ``, `${_time} ${_content}`);
    }
  };
  let error = content => {
    log(LOG_LEVEL.ERROR, content);
  };
  let warn = content => {
    log(LOG_LEVEL.WARN, content);
  };
  let fatal = content => {
    log(LOG_LEVEL.FATAL, content);
  };
  let info = content => {
    log(LOG_LEVEL.INFO, content);
  };
  let report = ({
    start,
    end,
    messageId
  }) => {
    let params = {
      name: TABLE_NAME,
      index: {
        name: INDEX.TIME,
        type: 'bound',
        values: [start, end, false, false]
      }
    };
    let key = common.getNaviStorageKey();
    let navi = Storage.get(key);
    $db.search(params, result => {
      let user = getCurrentUser();
      let {
        token
      } = user;
      let api = navi.url || '';
      let url = `${api}/navigator/upload-log-plain`;
      jrequest.requestNormal(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-appkey': appkey,
          'x-token': token
        },
        body: utils.toJSON({
          msg_id: messageId,
          log: utils.toJSON(result.list)
        })
      });
    });
  };
  return {
    log,
    error,
    warn,
    fatal,
    info,
    report
  };
}

let init = config => {
  let emitter = Emitter();
  let provider = {};
  let {
    upload,
    appkey = '',
    log = {}
  } = config;
  let uploadType = common.checkUploadType(upload);
  let sessionId = common.getSessionId();
  let logger = Logger({
    ...log,
    appkey,
    sessionId,
    getCurrentUser: getCurrentUser,
    getVersion: getVersion
  });

  // 移除 AppKey 前后空格
  appkey = appkey.trim();
  utils.extend(config, {
    uploadType,
    logger,
    appkey
  });
  let io = IO(config);
  function getCurrentUser() {
    return io.getCurrentUser({
      ignores: []
    });
  }
  function getVersion() {
    return io.getVersion();
  }
  let web = Web.init({
    io,
    emitter,
    logger
  });
  provider = web;

  /* PC 特性检查： 全局变量中存在约定变量自动切换为 PC */
  if (common.isDesktop()) {
    emitter = Emitter();
    provider = Desktop.init({
      appkey,
      io,
      emitter,
      web,
      client: JGChatPCClient,
      logger
    });
  }
  let plugins = {
    call: () => {
      return RTCSignal({
        io,
        emitter,
        logger
      });
    }
  };

  // PC 和 Web 复用的事件在此处透传
  io.on(SIGNAL_NAME.CMD_STREAM_APPENDED, message => {
    emitter.emit(EVENT.STREAM_APPENDED, {
      message
    });
  });
  io.on(SIGNAL_NAME.CMD_STREAM_COMPLETED, message => {
    let {
      conversationId,
      conversationType,
      messageId
    } = message;
    provider.message.getMessagesByIds({
      conversationId,
      conversationType,
      messageIds: [messageId]
    }).then(({
      messages
    }) => {
      let msg = messages[0] || {
        content: ''
      };
      emitter.emit(EVENT.STREAM_COMPLETED, {
        message: {
          ...message,
          content: msg.content
        }
      });
    });
  });
  let _export = {
    ...provider.socket,
    ...provider.message,
    ...provider.conversation,
    ...provider.chatroom,
    ...emitter,
    registerMessage: common.registerMessage,
    isDesktop: common.isDesktop,
    install: plugin => {
      if (!utils.isObject(plugin)) {
        return;
      }
      let {
        name
      } = plugin;
      let func = plugins[name] || function () {
        return {};
      };
      let apis = func();
      return apis;
    },
    Event: EVENT,
    ConnectionState: CONNECT_STATE,
    ConversationType: CONVERATION_TYPE,
    MessageType: MESSAGE_TYPE,
    ConversationOrder: CONVERSATION_ORDER,
    ErrorType,
    MentionType: MENTION_TYPE,
    MessageOrder: MESSAGE_ORDER,
    MentionOrder: MENTION_ORDER,
    FileType: FILE_TYPE,
    UndisturbType: UNDISTURB_TYPE,
    SentState: MESSAGE_SENT_STATE,
    UnreadTag: UNREAD_TAG,
    ConversationTagType: CONVERATION_TAG_TYPE,
    MediaType: MEDIA_TYPE,
    UserType: USER_TYPE,
    StreamEvent: STREAM_EVENT,
    ConversationTopType: CONVERSATION_TOP_TYPE
  };
  return _export;
};
var client = {
  init,
  Event: EVENT,
  ConnectionState: CONNECT_STATE,
  ConversationType: CONVERATION_TYPE,
  MessageType: MESSAGE_TYPE,
  ConversationOrder: CONVERSATION_ORDER,
  ErrorType,
  MentionType: MENTION_TYPE,
  MessageOrder: MESSAGE_ORDER,
  MentionOrder: MENTION_ORDER,
  FileType: FILE_TYPE,
  UndisturbType: UNDISTURB_TYPE,
  SentState: MESSAGE_SENT_STATE,
  UnreadTag: UNREAD_TAG,
  ConversationTagType: CONVERATION_TAG_TYPE,
  MediaType: MEDIA_TYPE,
  UserType: USER_TYPE,
  StreamEvent: STREAM_EVENT,
  ConversationTopType: CONVERSATION_TOP_TYPE
};

var index = {
  ...client
};

export { index as default };
