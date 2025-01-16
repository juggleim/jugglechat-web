import { request } from './request';
import SERVER_PATH from './api';
import utils from '../common/utils';
function answer(data){
  return request(SERVER_PATH.AI_ANSWER, {
    method: 'POST',
    body: utils.toJSON(data)
  });
}

export default {
  answer,
}