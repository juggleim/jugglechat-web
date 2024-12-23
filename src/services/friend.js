import { request } from './request';
import SERVER_PATH from './api';
import utils from '../common/utils';

function add(friend){
  let { friendId } = friend;
  return request(SERVER_PATH.FRIEND_ADD, {
    method: 'POST',
    body: utils.toJSON({
      friend_id: friendId
    })
  });
}

function remove(friend){
  let { friendId } = friend;
  return request(SERVER_PATH.FRIEND_REMOVE, {
    method: 'POST',
    body: utils.toJSON({
      friend_ids: [friendId]
    })
  });
}
function getList({ startUserId, count, order }){
  let url = `${SERVER_PATH.FRIEND_LIST}?count=${count}&offset=${startUserId}`;
  return request(url, {
    method: 'GET'
  });
}
function getNewList({ start, count, order }){
  let url = `${SERVER_PATH.FRIEND_NEW_LIST}?start=${start}&count=${count}&order=${order}`;
  return request(url, {
    method: 'GET'
  }).then((result) => {
    return result;
  });
}
let botResult = {};
function getBots({ count }){
  if(!utils.isEmpty(botResult)){
    return Promise.resolve(botResult);
  }
  let url = `${SERVER_PATH.FRIEND_BOTS}?count=${count}`;
  return request(url, {
    method: 'GET'
  }).then((result) => {
    botResult = result;
    return result;
  });
}
function get({ id }, callback){
  let url = `${SERVER_PATH.USER_GET}?user_id=${id}`;
  return request(url, { method: 'GET' }).then((result) => {
    let { data } = result;
    callback(data);
  });
}
function confirm({ sponsor_id, is_agree }){
  return request(SERVER_PATH.FRIEND_CONFIRM, {
    method: 'POST',
    body: utils.toJSON({
      sponsor_id, is_agree
    })
  });
}
export default {
  add,
  remove,
  getList,
  getNewList,
  getBots,
  confirm,
  get,
}