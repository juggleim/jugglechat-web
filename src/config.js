
import { STORAGE } from "./common/enum";
import Stroage from "./common/storage";

let appConfig = Stroage.get(STORAGE.SERVER_SETTING);
let appkey = appConfig.appkey || 'nsw3sue72begyv7y';
let server = appConfig.server || 'ws.juggleim.com';

export let CONFIG = {
  appkey: appkey,
  API: server,
  serverList: [server],
  rtcAppId: 1881186044,
};
