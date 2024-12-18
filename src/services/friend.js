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
let friends = [];
function getList({ startUserId, count, order }){
  let url = `${SERVER_PATH.FRIEND_LIST}?count=${count}&offset=${startUserId}`;
  return request(url, {
    method: 'GET'
  }).then((result) => {
    let { data: { items = [] } } = result;
    friends = friends.concat(items);
    return result;
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
function get({ id }, callback){
  let friend = utils.filter(friends, (friend) => {
    return utils.isEqual(friend.user_id, id);
  })[0] || { };
  if(!utils.isEmpty(friend)){
    return callback(friend);
  }
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
  confirm,
  get,
}