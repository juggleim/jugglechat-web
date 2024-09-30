let EVENT_NAME = {
  CONVERSATION_HIDE_SEARCH: 'on_hide_search',
  ON_USER_INFO_UPDATE: 'on_user_info_updated',
  UN_UNATHORIZED: 'unathorized',
  SEND_MESSAGE: 'on_send_message',
  ON_ADDED_FRIEND: 'on_added_friend',
  ON_GROUP_CREATED: 'on_group_created',
  ON_GROUP_MEMBER_ADDED: 'on_group_member_added',
  ON_GROUP_MEMBER_REMOVED: 'on_group_member_removed',

  ON_CONVERSATION_TAG_CHANGED: 'on_conversation_tag_changed',
};
export let STORAGE = {
  PREFIX: 'jgweb',
  USER_TOKEN: 'user_auth_token'
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
};
let GROUP_CHANGE_TYPE = {
  ADD_MEMBER: 1,
  REMOVE_MEMBER: 2,
  RENAME: 3
};
let MSG_NAME = {
  GROUP_NTF: 'jgd:grpntf',
  FRIEND_NTF: 'jgd:friendntf',
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
export { EMOJI_POS_LIST, EVENT_NAME, TRANSFER_TYPE, CONTACT_TAB_TYPE, RESPONSE, GROUP_CHANGE_TYPE, MSG_NAME, REG_EXP, MESSAGE_OP_TYPE, CONVERATION_TAG_ID, CONVERSATION_TAG_TYPE }