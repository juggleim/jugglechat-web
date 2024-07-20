import { request } from './request';
import SERVER_PATH from './api';
import utils from '../common/utils';

function add(friend){
  let { friendId, userId } = friend;
  return request(SERVER_PATH.FRIEND_ADD, {
    method: 'POST',
    body: utils.toJSON({
      user_id: userId,
      friend_id: friendId
    })
  });
}

function remove(friend){
  let { friendId, userId } = friend;
  return request(SERVER_PATH.FRIEND_REMOVE, {
    method: 'POST',
    body: utils.toJSON({
      user_id: userId,
      friend_id: friendId
    })
  });
}
let friends = [];
function getList({ startUserId, count, userId }){
  let url = `${SERVER_PATH.FRIEND_LIST}?user_id=${userId}&count=${count}&start_id=${startUserId}`;
  return request(url, {
    method: 'GET'
  }).then((result) => {
    let { data: { items = [] } } = result;
    friends = friends.concat(items);
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
export default {
  add,
  remove,
  getList,
  get,
}