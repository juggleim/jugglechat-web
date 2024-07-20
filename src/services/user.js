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
export default {
  sendCode,
  verifyCode,
  update,
  search,
  getFileToken,
}