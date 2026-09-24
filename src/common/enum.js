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
  ON_CALL_FINISHED: 'on_call_finished',

  ON_APP_LANGUAGE_CHANGED: 'on_app_language_changed'
};
export let STORAGE = {
  PREFIX: 'jgweb',
  USER_TOKEN: 'user_auth_token',
  SERVER_SETTING: 'server_setting',
  TRANSLATE_CONF: 'translate_conf',
  USERS: 'users_auth',
  APP_LANGUAGE: 'app_language'
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
  CONTACT_CARD: 'jgd:contactcard',
};
let REG_EXP = {
  LINK: /(([^:]+:)\/\/(([^:\/\?#]+)(:\d+)?))(\/[^?#]*)?(\?[^#]*)?(#.*)?/g,
}
let MESSAGE_OP_TYPE = {
  TRANSLATE: 1,
  REMOVE: 2
};

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
  { title: 'Auto', name: 'auto' },
  { title: 'Simplified Chinese', name: 'zh-CHS' },
  { title: 'Traditional Chinese', name: 'zh-CHT' },
  { title: 'English', name: 'en' },
  { title: 'Français', name: 'fr' },
  { title: 'Indonesia', name: 'id' },
  { title: 'Japanese', name: 'ja' },
  { title: '한국어', name: 'ko' },
  { title: 'ภาษาไทย', name: 'th' },
];
let ASIDE_MENU_TYPE = {
  ADD_FRIREND: 1,
  ADD_GROUP: 2,
  MESSAGE: 3,
  CONTACT: 4,
  USER_SETTING: 6,
  USER_UPDATE: 7,
  USER_LOGOUT: 8,
  USER_ACCOUNT: 9,
  SETTING: 10,
  USER_QRCODE: 11,
  USER_FAV: 12,
  USER_AGREEMENT: 13,
  USER_PRIVACY: 14,
  LANGUAGE: 15
};

let USER_AGREEMENT = {
  USER: 'https://juggle.im/jc/user.html',
  PRIVACY: 'https://juggle.im/jc/privacy.html',
};

let LOGIN_TYPE = {
  PHONE: 1,
  QRCODE: 2,
  EMAIL: 3,
};

export { LOGIN_TYPE, USER_AGREEMENT, ASIDE_MENU_TYPE, LANGUAGES, GROUP_ROLE, ASIDER_SETTING_SWITCH, GROUP_AVATAR, FILE_TYPE, SYS_CONVERSATION_FRIEND, SYS_CONVERSATION_GROUP, IGNORE_CONVERSATIONS, FRIEND_APPLY_STATUS, CONTACT_TYPE, SETTING_TYPE, EVENT_NAME, TRANSFER_TYPE, CONTACT_TAB_TYPE, RESPONSE, GROUP_CHANGE_TYPE, MSG_NAME, REG_EXP, MESSAGE_OP_TYPE, CONVERATION_TAG_ID, CONVERSATION_TAG_TYPE }
