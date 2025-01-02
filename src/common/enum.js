let EVENT_NAME = {
  CONVERSATION_HIDE_SEARCH: 'on_hide_search',
  ON_USER_INFO_UPDATE: 'on_user_info_updated',
  UN_UNATHORIZED: 'unathorized',
  SEND_MESSAGE: 'on_send_message',
  ON_ADDED_FRIEND: 'on_added_friend',
  ON_GROUP_CREATED: 'on_group_created',
  ON_GROUP_MEMBER_ADDED: 'on_group_member_added',
  ON_GROUP_MEMBER_REMOVED: 'on_group_member_removed',
  
  ON_CONVERSATION_RESET: 'on_conversation_reset',
  
  ON_CONVERSATION_SEARCH_NAV: 'on_conversation_search_nav',
  
  ON_CONVERSATION_TAG_CHANGED: 'on_conversation_tag_changed',

  ON_SHOW_CALL_DIALOG: 'on_show_call_dialog',
  ON_CALL_FINISHED: 'on_call_finished'
};
export let STORAGE = {
  PREFIX: 'jgweb',
  USER_TOKEN: 'user_auth_token',
  SERVER_SETTING: 'server_setting',
  TRANSLATE_CONF: 'translate_conf',
  USERS: 'users_auth',
}
let TRANSFER_TYPE = {
  NONE: -1,
  ONE: 1,
  MERGE: 2,
  DELETE: 3
}

let CONTACT_TAB_TYPE = {
  CONTACT: 'contact',
  GROUP: 'group',
};

let RESPONSE = {
  SUCCESS: 0,
  UNATHORIZED: 401,
  USER_SEARCH_ERROR: 10509,

  LOGIN_QR_WATTING: 17006,
  LOGIN_QR_EXPIRE: 17007,
};
let GROUP_CHANGE_TYPE = {
  ADD_MEMBER: 1,
  REMOVE_MEMBER: 2,
  RENAME: 3,
  TRANSFER_OWNER: 4,
};
let MSG_NAME = {
  GROUP_NTF: 'jgd:grpntf',
  FRIEND_NTF: 'jgd:friendntf',
  FRIEND_APPLY: 'jgd:friendapply',
};
let REG_EXP = {
  LINK: /(([^:]+:)\/\/(([^:\/\?#]+)(:\d+)?))(\/[^?#]*)?(\?[^#]*)?(#.*)?/g,
}
let MESSAGE_OP_TYPE = {
  TRANSLATE: 1,
  REMOVE: 2
};

let EMOJI_POS_LIST = [
  { pos: '-64px -6px', text: '😀' },
  { pos: '-96px -6px', text: '😆' },
  { pos: '-128px -6px', text: '😄' },
  { pos: '-160px -6px', text: '😁' },
  { pos: '-192px -6px', text: '🙂' },
  { pos: '-222px -6px', text: '🙃' },
  { pos: '-254px -6px', text: '🙁' },
  { pos: '-130px -190px', text: '😭' },
  { pos: '-284px -42px', text: '😡' },
  { pos: '-68px -152px', text: '😬' },
  { pos: '-96px -152px', text: '😅' },
  { pos: '-312px -42px', text: '😌' },
  { pos: '-128px -152px', text: '😓' },
  { pos: '-6px -78px', text: '😒' },
  { pos: '-36px -78px', text: '😏' },
  { pos: '-68px -78px', text: '😉' },
  { pos: '-100px -78px', text: '😘' },
  { pos: '-162px -78px', text: '😗' },
  { pos: '-254px -78px', text: '😔' },
  { pos: '-285px -78px', text: '😖' },
  { pos: '-3px -114px', text: '😊' },
  { pos: '-34px -114px', text: '🤗' },
  { pos: '-66px -114px', text: '😵' },
  { pos: '-100px -114px', text: '😲' },
  { pos: '-130px -114px', text: '😩' },
  { pos: '-160px -114px', text: '😝' },
  { pos: '-192px -114px', text: '😛' },
  { pos: '-224px -114px', text: '😜' },
  { pos: '-254px -114px', text: '😋' },
  { pos: '-284px -114px', text: '🙄' },
  { pos: '-312px -114px', text: '😳' },
  { pos: '-32px -149px', text: '😇' },
  { pos: '-284px -150px', text: '😱' },
  { pos: '-315px -150px', text: '😂' },
  { pos: '-6px -186px', text: '😪' },
  { pos: '-36px -186px', text: '😎' },
  { pos: '-68px -186px', text: '😷' },
  { pos: '-100px -186px', text: '😴' },
  { pos: '-316px -186px', text: '🤓' },
  { pos: '-36px -224px', text: '💩' },
  ]
let CONVERATION_TAG_ID = {
  ALL: 'jg_all'
}
let CONVERSATION_TAG_TYPE = {
  CUSTOM: 0
};
let SETTING_TYPE = {
  USER: 1,
  SETTING: 2,
};
let CONTACT_TYPE = {
  FRIEND: 1,
  GROUP: 2,
  NEW_FRIEND: 10,
  BOT: 11
}

// 0：申请中；1：已同意；2：已拒绝；3：申请已过期
let FRIEND_APPLY_STATUS = {
  APPLYING: 0,
  ACCEPTED: 1,
  DECLINED: 2,
  EXPIRED: 3
};
let SYS_CONVERSATION_FRIEND = 'friend_apply';
let SYS_CONVERSATION_GROUP = '';
let IGNORE_CONVERSATIONS = [SYS_CONVERSATION_FRIEND, SYS_CONVERSATION_GROUP];

let FILE_TYPE = {
  IMAGE: 1,
  AUDIO: 2,
  VIDEO: 3,
  FILE: 4,
};

let GROUP_AVATAR = 'https://jugglechat-file.oss-cn-beijing.aliyuncs.com/images%2F9HKsMKLBAgv9s5NC0vu3-R.png';

let ASIDER_SETTING_SWITCH = {
  TOP: 'top',
  MUTE: 'mute',
  HISTORY: 'history',
  // 群组禁言
  BAN: 'group_ban',
};

let GROUP_ROLE = {
  MEMBER: 0,
  OWNER: 1,
  MANGENT: 2
};
let LANGUAGES = [
  { title: '自动检测', name: 'auto' },
  { title: '简体中文', name: 'zh-CHS' },
  { title: '繁體中文', name: 'zh-CHT' },
  { title: 'English', name: 'en' },
  { title: 'Français', name: 'fr' },
  { title: 'Indonesia', name: 'id' },
  { title: '日本語', name: 'ja' },
  { title: '한국어', name: 'ko' },
  { title: 'ภาษาไทย', name: 'th' },
];
export { LANGUAGES, GROUP_ROLE, ASIDER_SETTING_SWITCH, GROUP_AVATAR, FILE_TYPE, SYS_CONVERSATION_FRIEND, SYS_CONVERSATION_GROUP, IGNORE_CONVERSATIONS, FRIEND_APPLY_STATUS, CONTACT_TYPE, SETTING_TYPE, EMOJI_POS_LIST, EVENT_NAME, TRANSFER_TYPE, CONTACT_TAB_TYPE, RESPONSE, GROUP_CHANGE_TYPE, MSG_NAME, REG_EXP, MESSAGE_OP_TYPE, CONVERATION_TAG_ID, CONVERSATION_TAG_TYPE }