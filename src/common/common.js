import utils from "./utils";
import { User, Group, Friend } from "../services/index";
import html2canvas from 'html2canvas';
import im from './im';

function isElementTop(message){
  var chatNode = document.querySelector('.tyn-chat-body');
  var messageNode = document.querySelector(`div[messageid="${message.messageId}"]`);
  if(!messageNode){
    messageNode = document.querySelector(`div[tid="${message.tid}"]`);
  }
  let num = chatNode.offsetTop-messageNode.getBoundingClientRect().bottom;
  return num > -200;
}
function getAvatars(){
  let avatars = [
    '0d93f139-23f8-4b48-ae3a-a929a0c864c3.png',
    'b7528d61-f7e2-4436-b650-dc4050738997.png',
    '55e321a8-645a-47ae-99ae-284a70086b95.png',
    '1617a7b2-ddc8-4a87-9353-c7a53d84e37e.png',
    '5f541328-3dd3-4f65-be26-c47dfbf0c4cb.png',
    'fdc3281e-68d3-4509-af00-ed34dc1017a2.png',
    'bfa67c9c-a174-43da-89b5-4515c26e7b44.png',
    '60817dca-1775-4bb5-9857-d9c6c6220258.png',
    '52edea67-7c11-4964-8309-c32ad6030592.png',
    'e9b06008-1e41-455a-9b1d-d462704bdc80.png',
    '210f1a21-e389-46e3-a6bd-97fcabf0736b.png',
    '4d4fde6c-a74b-4c65-8cd6-adc9097d53a3.png',
    'd37a53f4-8593-4520-9500-182933644286.png',
    '79e3a26d-bb86-471a-a4b7-4c674fad4d1d.png',
    '2d90da22-d42c-4250-866e-906e223293f3.png',
    '21421268-16bf-448e-9400-49e5f2964ed1.png',
    '6499c545-4ce2-4d6f-bd72-b0e9435c9172.png',
    '0815e98a-184c-4b37-9749-634307f1a6f1.png',
    'c28b3f77-74a2-4dfa-97ad-e3cd6740b7ef.png',
    'a75d8e30-1254-491b-9499-ab00bc51acba.png',
    'c6dfd428-be75-4631-a000-5af0b1a3a1d2.png',
    '63a73984-065d-4fd9-832f-dca93b904f8f.png',
    'a608ee1b-6797-4bc1-9fa4-a648ca460f75.png',
    '9871d8ea-37d9-4a56-b628-c7e6ef875909.png',
    'c960c09b-4662-42b1-b9fe-06b0f377da7f.png',
    'f21c1ede-acf5-4e10-89e6-721be2a650db.png',
    '8689a96d-2034-4d37-87f8-540f3054d70b.png',
    'fcc3af78-f726-4dab-a9c4-783e4a7c9c89.png',
    '6f5adfa2-e9e1-4638-9f11-2ae31a122d63.png',
    '90ba7b04-f069-4a5b-ad04-f80ac5a02f0f.png',
    'a7c14cb5-302c-4a3f-9ce9-a9f8845096b8.png',
    '6c5ed2a1-740d-48a2-b8bd-b0940d2a4745.png',
    '82019942-abec-4a85-b221-d8955dfac2d1.png',
    '8de64b86-2757-41bc-8ef9-eb7d51865e8b.png',
    'eeb2da55-5de4-4783-9889-6679b183ac09.png',
    'a341e011-a542-4500-ae26-8d46be284f00.png',
    '89acab9c-2692-4c22-bab0-a20ec29af9bc.png',
    '0e834e54-d30a-4556-8f45-b2bb46739753.png',
    '17dd1d48-48a5-42b5-91d9-0db238f5924f.png',
    'e476dc01-f9f5-4f7f-928c-5c6d4b466875.png',
    'be965051-9277-4368-827c-57691d3ccd28.png',
    '0605ad1c-fa05-4b78-aabf-4ae179f6e62d.png',
    'e38bb843-8bf8-494e-9165-1d6ba72bd481.png',
    'a0af28af-d6f1-4072-8c9b-16f6115733ac.png',
    '8866bda4-9324-4b94-a539-62ae685ef26c.png',
    '8e38b527-9a94-408a-a58e-4afc7b75e88d.png',
    'ee751e88-c034-4656-ad00-6f13993a31f6.png',
    '16e82d29-bbf0-40e0-89fa-9a55ccf4d02b.png',
    'd17cf14f-4017-4519-869e-baddbd3900e1.png',
    'ca4c1ea3-daf7-435c-b9d5-06f5beba6f5f.png',
    '290c9b39-b193-4056-8cd8-ec33ff7132f2.png',
    '47eef4a1-d2af-48f8-85ac-fb100c715a82.png',
    'bc37a8e8-3f4a-49fd-9c7f-f7e408a7ecb9.png',
    '83e7100d-baf9-4bb9-9db9-4fe4b29b1b7d.png',
    'b856fa71-468e-485d-a77b-592256d08b6a.png',
    '3402da95-84ea-4c38-8d43-42127448f8f2.png',
    '7a0d8ff5-f42f-4263-9880-0888f3683324.png',
    '8d89fea5-4748-4654-96c9-d50589ac190d.png',
    '2fdf40b3-b625-4ede-b898-9ff4da939ce4.png',
    '15293250-c8aa-4627-ac21-2b2db470ab32.png',
    '024fc0bd-433d-4d63-a747-ab4f936a3ff0.png',
    '86e493f5-6777-4ef7-be42-37479151e0cf.png',
    '647a2bd0-3539-4afd-ad87-d96625576d3b.png',
    '8c3a3e5c-ddc0-4205-a843-cf2ce51fa15c.png',
    'c1796da9-72c6-4df7-9718-669af7f31e6b.png',
    'e5daaa82-d364-456b-9351-5303ba2d07ac.png',
    '6ff3cc9c-4466-4610-9666-b39cae20487c.png',
    '2ec45fba-0310-467d-93f3-747d80d8dd05.png',
    '21d377f2-d03c-49c9-9f22-c68de3935e40.png',
    '357f4559-8cb4-4937-bbb7-707d6cc0ccc5.png',
    'a0fd2af9-49cb-436f-b192-356bd7c1f340.png',
    '0ca0c8ec-e108-44ba-bfde-1c6ac60e1d0c.png',
    '25d56494-b5dc-4235-b7ad-53701251aa7d.png',
    '2db4dbe7-66c6-4cb0-b3b5-40560d824c7d.png',
    '2f6c22f5-0043-4377-98f7-043c0b98532e.png',
  ];
  avatars = avatars.map((avatar) => {
    return `https://file.lwoowl.cn/avatar_jgd/${avatar}`;
  });
  return avatars;
}
function getAvatar(){
  let avatars = getAvatars();
    let index = Math.floor(Math.random() * avatars.length);
    return avatars[index];
}

let textAvatars = {};
function getTextAvatar(name, option = {}){
  let avatar = textAvatars[name];
  if(avatar){
    return avatar;
  }
  let textLen = name.length;
  let text = name;
  if(textLen > 2){
    text = text.substr(textLen - 2);
  }
  let { height = 100, width = 100 } = option;
  let colors = [utils.random(), utils.random(), utils.random()];
  let cvs = document.createElement("canvas");
  cvs.setAttribute('width', width);
  cvs.setAttribute('height', height);
  let ctx = cvs.getContext("2d");
  ctx.fillStyle = `rgb(${colors.join(',')})`;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgb(255,255,255)';
  let isZH = utils.isChinese(text);
  let size = isZH ? 0.38 : 0.5;
  ctx.font = `${ width * size }px Arial`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  let fix = ctx.measureText(text).actualBoundingBoxDescent/2;
  ctx.fillText(text,width/2, height/2 + fix/2);
  let url = cvs.toDataURL('image/jpeg', 1);
  textAvatars[name] = url;
  return url;
}
function uploadBase64(str, callback){
  User.getFileToken().then(({ code, data }) => {
    fetch(str).then((res) => {
      return res.blob()
    }).then(({ size }) => {
      let { token, domain } = data;
      str = str.replace('data:image/png;base64,', '');
      let name = `${utils.getUUID()}.png`;
      name = utils.toBase64(name);
      let url = `https://up-z1.qiniup.com/putb64/${size}/key/${name}`;
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange=function(){
        if (utils.isEqual(xhr.readyState, 4)){
          let obj = utils.parse(xhr.responseText)
          callback(`${domain}/${obj.key}`);
        }
      }
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('Authorization', `UpToken ${token}`);
      xhr.send(str);
    });
  });
}

/* 
let groupAvatars = [
  { avatar: 'https://file.lwoowl.cn/36dc-db4c.png?attname=36dc-db4c.png' },  
];
common.createGroupAvatar(groupAvatars, ({url}) => {
  console.log(url)
})
*/
function createGroupAvatar(members, callback){
  let memberLen = members.length;
  let parent = document.createElement('div');
  parent.classList = ['tyn-media tyn-size-lg d-none d-sm-inline-flex tyn-group-avatars'];
  parent.id = 'group_avatar_temp';
  parent.style.height = '100px';
  parent.style.width = '100px';
  utils.forEach(members, (member) => {
    let size = memberLen < 5 ? 48 : 33;
    let child = document.createElement('div');
    child.classList = ['tyn-group-avatar'];
    child.style.backgroundImage = `url(${member.avatar || member.portrait})`;
    child.style.height = `${size}%`;
    child.style.width = `${size}%`;
    parent.appendChild(child);
  });
  document.body.appendChild(parent);
  html2canvas(parent, { 
    useCORS: true,
  }).then(canvas => {
    let url = canvas.toDataURL('image/png', 1);
    document.body.removeChild(parent);
    uploadBase64(url, (avatar) => {
      callback(avatar);
    })
  });
}

function getConversationInfo(params, callback){
  let { type } = params;
  let juggle = im.getCurrent();
  let { ConversationType } = juggle;
  let isGroup = utils.isEqual(Number(type), ConversationType.GROUP);
  return isGroup ? Group.get(params, callback) : Friend.get(params, callback);
}
export default {
 isElementTop,
 getAvatar,
 getAvatars,
 getTextAvatar,
 createGroupAvatar,
 getConversationInfo,
}