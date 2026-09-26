import { request } from './request';
import SERVER_PATH from './api';
import utils from '../common/utils';
function sendCode(data){
  return request(SERVER_PATH.USER_SENDCODE, {
    method: 'POST',
    body: utils.toJSON(data)
  });
}
function verifyCode(data){
  return request(SERVER_PATH.USER_VERIFYCODE, {
    method: 'POST',
    body: utils.toJSON(data)
  });
}
function update(user){
  let { id, portrait, name } = user;
  return request(SERVER_PATH.USER_MODIFY, {
    method: 'POST',
    body: utils.toJSON({
      user_id: id,
      nickname: name,
      avatar: portrait,
    })
  });
}
function updateSetting(setting){
  return request(SERVER_PATH.USER_UPDATE_SETTING, {
    method: 'POST',
    body: utils.toJSON(setting)
  });
}
function search(user){
  return request(SERVER_PATH.USER_SEARCH, {
    method: 'POST',
    body: utils.toJSON(user)
  });
}
function getFileToken(params){
  return request(SERVER_PATH.USER_FILE_TOKEN, {
    method: 'POST',
    body: utils.toJSON(params)
  });
}
function get({ id }, callback){
  let url = `${SERVER_PATH.USER_GET}?user_id=${id}`;
  return request(url, { method: 'GET' }).then((result) => {
    callback(result);
  });
}

function getQRCode(data){
  return request(SERVER_PATH.USER_LOGIN_QRCODE, { method: 'GET'});
}
function startPolling({ id }){
  return request(SERVER_PATH.USER_LOGIN_POLLING, { 
    method: 'POST',
    body: utils.toJSON({ id })
  });
}

function getCurrentQRCode(data){
  return request(SERVER_PATH.USER_CURRENT_QRCODE, { method: 'GET'});
}

function sendEmailCode(data){
  return request(SERVER_PATH.USER_SEND_EMAIL_CODE, {
    method: 'POST',
    body: utils.toJSON(data)
  });
}
function verifyEmailCode(data){
  return request(SERVER_PATH.USER_VERIFY_EMAIL_CODE, {
    method: 'POST',
    body: utils.toJSON(data)
  });
}

export default {
  sendCode,
  verifyCode,
  update,
  updateSetting,
  search,
  getFileToken,
  get,
  startPolling,
  getQRCode,
  getCurrentQRCode,
  sendEmailCode,
	verifyEmailCode
}