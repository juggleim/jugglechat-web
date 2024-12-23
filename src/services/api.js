import { CONFIG } from '../config'
import utils from '../common/utils'
let SERVER_PATH = {
  USER_SENDCODE: 'sms/send',
  USER_VERIFYCODE: 'sms_login',
  USER_MODIFY: 'users/update',
  USER_UPDATE_SETTING: 'users/updsettings',
  USER_SEARCH: 'users/search',
  USER_FILE_TOKEN: 'file_cred',
  USER_GET: 'users/info',
  USER_LOGIN_QRCODE: 'login/qrcode',
  USER_LOGIN_POLLING: 'login/qrcode/check',

  FRIEND_ADD: 'friends/apply',
  FRIEND_REMOVE: 'friends/del',
  FRIEND_LIST: 'friends/list',
  FRIEND_NEW_LIST: 'friends/applications',
  FRIEND_CONFIRM: 'friends/confirm',
  FRIEND_BOTS: 'bots/list',
  
  GROUP_CREATE: 'groups/add',
  GROUP_UPDATE: 'groups/update',
  GROUP_LIST: 'groups/mygroups',
  GROUP_MEMBER_ADD: 'groups/members/add',
  GROUP_MEMBER_REMOVE: 'groups/members/del',
  GROUP_QUIT: 'groups/quit',
  GROUP_GET: 'groups/info',
  GROUP_SET_DISPLAY_NAME: 'groups/setdisplayname',
  GROUP_SET_NOTICE: 'groups/setgrpannouncement',
  GROUP_GET_NOTICE: 'groups/getgrpannouncement',
  GROUP_SET_HIS_VERIFY_TYPE: 'groups/management/sethismsgvisible',
};
utils.forEach(SERVER_PATH, (url, name) => {
  SERVER_PATH[name] = `${CONFIG.API}${url}`;
});

export default SERVER_PATH;