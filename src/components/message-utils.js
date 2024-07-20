import utils from "../common/utils";
import im from "../common/im";
let juggle = im.getCurrent();
let { ConversationType } = juggle;

let getGroupReadPercent = (msg) => {
  let { unreadCount = 1, readCount = 0 } = msg;
  let percent = readCount / (unreadCount + readCount);
  return Math.floor(percent * 360);
}

function isGroup(message) {
  return utils.isEqual(message.conversationType, ConversationType.GROUP);
}

export default {
  getGroupReadPercent,
  isGroup
}