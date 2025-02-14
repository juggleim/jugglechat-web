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

function quit(group){
  return request(SERVER_PATH.GROUP_QUIT, {
    method: 'POST',
    body: utils.toJSON(group)
  });
}

function getList({ startId, count }){
  let url = `${SERVER_PATH.GROUP_LIST}?count=${ count }&start_id=${startId}`;
  return request(url, {
    method: 'GET'
  });
}

function get({ id }, callback){
  let url = `${SERVER_PATH.GROUP_GET}?group_id=${id}`;
  return request(url, { method: 'GET' }).then((result) => {
    let { data = {} } = result;
    let { group_name, group_portrait, members = [], group_management, grp_display_name, member_count, my_role } = data;
    let info = { nickname: group_name, avatar: group_portrait, members, id, group_management, grp_display_name, member_count, my_role };
    callback(info);
  });
}

function invite({ group_id, members }){
  return request(SERVER_PATH.GROUP_MEMBER_INVITE, {
    method: 'POST',
    body: utils.toJSON({
      group_id: group_id,
      member_ids: utils.map(members, (member) => {
        return member.user_id;
      })
    })
  });
}

function removeMember({ id, members }){
  return request(SERVER_PATH.GROUP_MEMBER_REMOVE, {
    method: 'POST',
    body: utils.toJSON({
      group_id: id,
      member_ids: utils.map(members, (member) => {
        return member.id;
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


function setNotice(params){
  return request(SERVER_PATH.GROUP_SET_NOTICE, {
    method: 'POST',
    body: utils.toJSON(params)
  });
}

function getNotice({ group_id }){
  let url = `${SERVER_PATH.GROUP_GET_NOTICE}?group_id=${group_id}`;
  return request(url, {
    method: 'GET'
  });
}

function setGroupHisVerify({ group_id, num }){
  return request(SERVER_PATH.GROUP_SET_HIS_VERIFY_TYPE, {
    method: 'POST',
    body: utils.toJSON({ group_id, group_his_msg_visible: num })
  });
}

function setMute({ id, isMute }){
  return request(SERVER_PATH.GROUP_SET_MUTE, {
    method: 'POST',
    body: utils.toJSON({ group_id: id, is_mute: Number(isMute) })
  });
}

function transfer({ group_id, memberId }){
  return request(SERVER_PATH.GROUP_TRANSFER_OWNER, {
    method: 'POST',
    body: utils.toJSON({ group_id, owner_id: memberId })
  });
}

function getQrCode({ group_id }){
  let url = `${SERVER_PATH.GROUP_QRCODE}?group_id=${group_id}`;
  return request(url, {
    method: 'GET'
  });
}
export default {
  create,
  quit,
  getList,
  invite,
  removeMember,
  get,
  getMemory,
  update,
  setDisplayName,
  setNotice,
  getNotice,
  setGroupHisVerify,
  setMute,
  transfer,
  getQrCode,
}