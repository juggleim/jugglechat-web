import { request } from './request';
import SERVER_PATH from './api';
import utils from '../common/utils';

function create({ name, avatar, members }){
  let _members = utils.map(members, (member) => {
    let { user_id } = member;
    return { user_id };
  });
  return request(SERVER_PATH.GROUP_CREATE, {
    method: 'POST',
    body: utils.toJSON({
      group_name: name,
      group_portrait: avatar,
      members: _members
    })
  });
}

function update(group){
  return request(SERVER_PATH.GROUP_UPDATE, {
    method: 'POST',
    body: utils.toJSON(group)
  });
}

function dissolve(group){
  return request(SERVER_PATH.GROUP_DISSOLVE, {
    method: 'POST',
    body: utils.toJSON({})
  });
}

function getList({ startId, count }){
  let url = `${SERVER_PATH.GROUP_LIST}?count=${count}&start_id=${startId}`;
  return request(url, {
    method: 'GET'
  });
}

let groups = [];
function get({ id }, callback){
  let group = utils.filter(groups, (group) => {
    return utils.isEqual(group.id, id);
  })[0] || { };
  if(!utils.isEmpty(group)){
    return callback({ nickname: group.group_name, avatar: group.group_portrait,  members: group.members });
  }
  let url = `${SERVER_PATH.GROUP_GET}?group_id=${id}`;
  return request(url, { method: 'GET' }).then((result) => {
    let { data = {} } = result;
    let info = { nickname: data.group_name, avatar: data.group_portrait, members: data.members || [], id };
    groups.push(data);
    callback(info);
  });
}

function addMember({ id, members }){
  return request(SERVER_PATH.GROUP_MEMBER_ADD, {
    method: 'POST',
    body: utils.toJSON({
      group_id: id,
      members: utils.map(members, (member) => {
        let { user_id } = member;
        return { user_id };
      })
    })
  });
}

function removeMember({ id, members }){
  return request(SERVER_PATH.GROUP_MEMBER_REMOVE, {
    method: 'POST',
    body: utils.toJSON({
      group_id: id,
      members: utils.map(members, (member) => {
        let { id } = member;
        return { user_id: id };
      })
    })
  });
}
function getMemory({ id }){
  return utils.filter(groups, (group) => {
    return utils.isEqual(group.user_id, id);
  })[0] || { user_id: id };
}
function setDisplayName(params){
  return request(SERVER_PATH.GROUP_SET_DISPLAY_NAME, {
    method: 'POST',
    body: utils.toJSON(params)
  });
}

export default {
  create,
  dissolve,
  getList,
  addMember,
  removeMember,
  get,
  getMemory,
  update,
  setDisplayName,
}