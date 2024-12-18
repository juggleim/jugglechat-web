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
function getFileToken(){
  return request(SERVER_PATH.USER_FILE_TOKEN, {
    method: 'GET'
  });
}
function get({ id }, callback){
  let url = `${SERVER_PATH.USER_GET}?user_id=${id}`;
  return request(url, { method: 'GET' }).then((result) => {
    callback(result);
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
}