import utils from '../common/utils';
import { STORAGE, RESPONSE, EVENT_NAME } from '../common/enum';
import Storage from '../common/storage';
import EventSent from '../common/eventsent';
import emitter from "../common/emmit";
import { CONFIG } from '../config';

function request(url, options = {}){
  let user = Storage.get(STORAGE.USER_TOKEN) || {};
  let { authorization } = user;
  let headers = {
    'Content-Type': 'application/json',
    AppKey: CONFIG.appkey
  };
  if(authorization){
    headers['Authorization'] = authorization;
  }
  let _headers = options.headers || {};
  options.headers = utils.extend(_headers, headers);
  return fetch(url, options).then((res) => {
    if(utils.isEqual(res.status, RESPONSE.UNATHORIZED)){
      return emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
    }
    return res.json();
  });
}

function requestStream(url, options){
  let user = Storage.get(STORAGE.USER_TOKEN) || {}
  let headers = {
    'Authorization': user.authorization || '',
    'X-Platform': 'web',
  };
  utils.extend(options, { headers })
  return new EventSent(url, options);
}
export {
  request,
  requestStream
}
