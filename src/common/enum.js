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
  MERGE: 2
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
export { EVENT_NAME, TRANSFER_TYPE, CONTACT_TAB_TYPE, RESPONSE, GROUP_CHANGE_TYPE, MSG_NAME }