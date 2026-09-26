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
  USER_CURRENT_QRCODE: 'users/qrcode',

  USER_SEND_EMAIL_CODE: 'email/send',
	USER_VERIFY_EMAIL_CODE: 'email/login',
  
  FRIEND_ADD: 'friends/apply',
  FRIEND_REMOVE: 'friends/del',
  FRIEND_LIST: 'friends/list',
  FRIEND_NEW_LIST: 'friends/applications',
  FRIEND_CONFIRM: 'friends/confirm',
  FRIEND_BOTS: 'bots/list',
  
  GROUP_CREATE: 'groups/add',
  GROUP_UPDATE: 'groups/update',
  GROUP_LIST: 'groups/mygroups',
  GROUP_MEMBER_INVITE: 'groups/invite',
  GROUP_MEMBER_REMOVE: 'groups/members/del',
  GROUP_QUIT: 'groups/quit',
  GROUP_GET: 'groups/info',
  GROUP_SET_DISPLAY_NAME: 'groups/setdisplayname',
  GROUP_SET_NOTICE: 'groups/setgrpannouncement',
  GROUP_GET_NOTICE: 'groups/getgrpannouncement',
  GROUP_SET_HIS_VERIFY_TYPE: 'groups/management/sethismsgvisible',
  GROUP_SET_MUTE: 'groups/management/setmute',
  GROUP_TRANSFER_OWNER: 'groups/management/chgowner',
  GROUP_QRCODE: 'groups/qrcode',

  AI_ANSWER: 'assistants/answer',
};
utils.forEach(SERVER_PATH, (url, name) => {
  let protoclName = location.protocol;
  if(protoclName == 'file:'){
    protoclName = 'https:';
  }
  SERVER_PATH[name] = `${protoclName}//${CONFIG.API}/jim/${url}`;
});

export default SERVER_PATH;