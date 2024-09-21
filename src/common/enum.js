let EVENT_NAME = {
  CONVERSATION_HIDE_SEARCH: 'on_hide_search',
  ON_USER_INFO_UPDATE: 'on_user_info_updated',
  UN_UNATHORIZED: 'unathorized',
  SEND_MESSAGE: 'on_send_message',
  ON_ADDED_FRIEND: 'on_added_friend',
  ON_GROUP_CREATED: 'on_group_created',
  ON_GROUP_MEMBER_ADDED: 'on_group_member_added',
  ON_GROUP_MEMBER_REMOVED: 'on_group_member_removed',
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
  GROUP_NTF: 'jgd:grpntf'
};
let REG_EXP = {
  LINK: /(([^:]+:)\/\/(([^:\/\?#]+)(:\d+)?))(\/[^?#]*)?(\?[^#]*)?(#.*)?/g,
}
let MESSAGE_OP_TYPE = {
  TRANSLATE: 1,
  REMOVE: 2
};
let EMOJI_POS_LIST = [
  { pos: '-91.4px -6px', text: '😀' },
  { pos: '-135.6px -6px', text: '😆' },
  { pos: '-179.8px -6px', text: '😄' },
  { pos: '-91.4px -214px', text: '😬' },
  { pos: '-135.6px -214px', text: '😅' },
  { pos: '-179.8px -214px', text: '😓' },
  { pos: '-224px -6px', text: '😁' },
  { pos: '-268.2px -6px', text: '🙂' },
  { pos: '-312.4px -6px', text: '🙃' },
  { pos: '-400.8px -6px', text: '🙁' },
  { pos: '-445px -6px', text: '😕' },
  { pos: '-3px -58px', text: '😐' },
  { pos: '-91.4px -58px', text: '😦' },
  { pos: '-400.8px -58px', text: '😡' },
  { pos: '-445px -58px', text: '😌' },
  { pos: '-3px -110px', text: '😒' },
  { pos: '-47.2px -110px', text: '😏' },
  { pos: '-91.4px -110px', text: '😉' },
  { pos: '-135.6px -110px', text: '😘' },
  { pos: '-268.2px -110px', text: '😗' },
  { pos: '-356.6px -110px', text: '😔' },
  { pos: '-400.8px -110px', text: '😖' },
  { pos: '-3px -162px', text: '😊' },
  { pos: '-47.2px -162px', text: '🤗' },
  { pos: '-91.4px -162px', text: '😵' },
  { pos: '-135.6px -162px', text: '😲' },
  { pos: '-179.8px -162px', text: '😩' },
  { pos: '-224px -162px', text: '😝' },
  { pos: '-268.2px -162px', text: '😛' },
  { pos: '-312.4px -162px', text: '😜' },
  { pos: '-356.6px -162px', text: '😋' },
  { pos: '-400.8px -162px', text: '🙄' },
  { pos: '-445px -162px', text: '😳' },
  { pos: '-47.2px -214px', text: '😇' },
  { pos: '-400.8px -214px', text: '😱' },
  { pos: '-445px -214px', text: '😂' },
  { pos: '-3px -266px', text: '😪' },
  { pos: '-47.2px -266px', text: '😎' },
  { pos: '-91.4px -266px', text: '😷' },
  { pos: '-135.6px -266px', text: '😴' },
  { pos: '-179.8px -266px', text: '😭' },
  { pos: '-445px -266px', text: '🤓' },
  { pos: '-46px -319px', text: '💩' },
  ]
export { EMOJI_POS_LIST, EVENT_NAME, TRANSFER_TYPE, CONTACT_TAB_TYPE, RESPONSE, GROUP_CHANGE_TYPE, MSG_NAME, REG_EXP, MESSAGE_OP_TYPE }