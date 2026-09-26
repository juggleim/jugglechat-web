
import { STORAGE } from "./common/enum";
import Stroage from "./common/storage";

let appConfig = Stroage.get(STORAGE.SERVER_SETTING);
let appkey = appConfig.appkey || 'V8JdAtyxQ98pP6n9';
let server = appConfig.server || '132.145.211.214:9003';

export let CONFIG = {
  appkey: appkey,
  API: server,
  serverList: [server],
  rtcAppId: 1881186044,
};
