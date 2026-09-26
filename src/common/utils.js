const noop = () => { };
const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};
const isArray = (arr) => {
  return Object.prototype.toString.call(arr) === '[object Array]';
};
const isFunction = (arr) => {
  return Object.prototype.toString.call(arr) === '[object Function]';
};
const isString = (str) => {
  return Object.prototype.toString.call(str) === '[object String]';
};
const isBoolean = (str) => {
  return Object.prototype.toString.call(str) === '[object Boolean]';
};
const isUndefined = (str) => {
  return Object.prototype.toString.call(str) === '[object Undefined]';
};
const isNull = (str) => {
  return Object.prototype.toString.call(str) === '[object Null]';
};
const isNumber = (str) => {
  return Object.prototype.toString.call(str) === '[object Number]';
};
const stringify = (obj) => {
  return JSON.stringify(obj);
};
const parse = (str) => {
  return JSON.parse(str);
};
const forEach = (obj, callback) => {
  callback = callback || noop;
  let loopObj = () => {
    for (var key in obj) {
      callback(obj[key], key, obj);
    }
  };
  var loopArr = () => {
    for (var i = 0, len = obj.length; i < len; i++) {
      callback(obj[i], i, obj);
    }
  };
  if (isObject(obj)) {
    loopObj();
  }
  if (isArray(obj)) {
    loopArr();
  }
};
const isEmpty = (obj) => {
  let result = true;
  if (isObject(obj)) {
    forEach(obj, () => {
      result = false;
    });
  }
  if (isString(obj) || isArray(obj)) {
    result = obj.length === 0;
  }
  if (isNumber(obj)) {
    result = obj === 0;
  }
  return result;
};
const rename = (origin, newNames) => {
  var isObj = isObject(origin);
  if (isObj) {
    origin = [origin];
  }
  origin = parse(stringify(origin));
  var updateProperty = function (val, key, obj) {
    delete obj[key];
    key = newNames[key];
    obj[key] = val;
  };
  forEach(origin, (item) => {
    forEach(item, (val, key, obj) => {
      var isRename = (key in newNames);
      (isRename ? updateProperty : noop)(val, key, obj);
    });
  });
  return isObject ? origin[0] : origin;
};
const extend = (destination, sources) => {
  sources = isArray(sources) ? sources : [sources];
  forEach(sources, (source) => {
    for (let key in source) {
      let value = source[key];
      if (!isUndefined(value)) {
        destination[key] = value;
      }
    }
  });
  return destination;
};
const Defer = Promise;
const deferred = (callback) => {
  return new Defer(callback);
};
const templateFormat = (tpl, data, regexp) => {
  if (!(isArray(data))) {
    data = [data];
  }
  let ret = [];
  let replaceAction = (object) => {
    return tpl.replace(regexp || (/\\?\{([^}]+)\}/g), (match, name) => {
      if (match.charAt(0) === '\\') return match.slice(1);
      return (object[name] !== undefined) ? object[name] : '{' + name + '}';
    });
  };
  for (let i = 0, j = data.length; i < j; i++) {
    ret.push(replaceAction(data[i]));
  }
  return ret.join('');
};
// 暂时支持 String
const isContain = (str, keyword) => {
  return str.indexOf(keyword) > -1;
};
const isEqual = (source, target) => {
  return source === target;
};
const Cache = (cache) => {
  if (!isObject(cache)) {
    cache = {};
  }
  let set = (key, value) => {
    cache[key] = value;
  };
  let get = (key) => {
    return cache[key];
  };
  let remove = (key) => {
    delete cache[key];
  };
  let getKeys = () => {
    let keys = [];
    for (let key in cache) {
      keys.push(key);
    }
    return keys;
  };
  let clear = () => {
    cache = {};
  };
  return {
    set,
    get,
    remove,
    getKeys,
    clear
  };
};
const request = (url, option) => {
  return deferred((resolve, reject) => {
    requestNormal(url, option, {
      success: resolve,
      fail: reject
    });
  });
};
const requestNormal = (url, option, callback) => {
  option = option || {};
  let xhr = new XMLHttpRequest();
  let method = option.method || 'GET';
  xhr.open(method, url, true);
  let headers = option.headers || {};
  forEach(headers, (header, name) => {
    xhr.setRequestHeader(name, header);
  });
  let body = option.body || {};
  let isSuccess = () => {
    return /^(200|202)$/.test(xhr.status);
  };
  let timeout = option.timeout;
  if (timeout) {
    xhr.timeout = timeout;
  }
  xhr.onreadystatechange = function () {
    if (isEqual(xhr.readyState, 4)) {
      let { responseText } = xhr;
      responseText = responseText || '{}';
      let result = JSON.parse(responseText);
      if (isSuccess()) {
        callback.success(result, xhr);
      } else {
        let { status } = xhr;
        let error = { status, result };
        callback.fail(error)
      }
    }
  };
  xhr.onerror = (error) => {
    callback.fail(error)
  }
  xhr.send(body);
  return xhr;
};
const map = (arrs, callback) => {
  return arrs.map(callback);
};
const filter = (arrs, callback) => {
  return arrs.filter(callback);
};
const uniq = (arrs, callback) => {
  let newData = [], tempData = {};
  arrs.forEach(target => {
    let temp = callback(target);
    tempData[temp.key] = temp.value;
  });
  forEach(tempData, (val) => {
    newData.push(val);
  })
  return newData;
};
const some = (arrs, callback) => {
  return arrs.some(callback);
};
const toJSON = (value) => {
  return JSON.stringify(value);
}
const toArray = (obj) => {
  let arrs = [];
  forEach(obj, (v, k) => {
    arrs.push([k, v]);
  });
  return arrs;
};

const isInclude = (str, match) => {
  return str.indexOf(match) > -1;
};
const isHighInclude = (arrs, callback) => {
  let index = find(arrs, callback);
  return index > -1;
}
const clone = (source) => {
  return JSON.parse(JSON.stringify(source));
};
function Index() {
  let index = 0;
  this.add = () => {
    index += 1;
  };
  this.get = () => {
    return index;
  }
  this.reset = () => {
    index = 0;
  };
}
function Observer() {
  let observers = [];
  this.add = (observer, force) => {
    if (isFunction(observer)) {
      if (force) {
        return observers = [observer];
      }
      observers.push(observer);
    }
  };
  this.remove = (observer) => {
    observers = filter(observers, (_observer) => {
      return _observer !== observer
    });
  };
  this.emit = (data) => {
    forEach(observers, (observer) => {
      observer(data);
    });
  };
}
function Prosumer() {
  let data = [], isConsuming = false;
  this.produce = (res) => {
    data.push(res);
  };
  this.consume = (callback, finished) => {
    if (isConsuming) {
      return;
    }
    isConsuming = true;
    let next = () => {
      let res = data.shift();
      if (isUndefined(res)) {
        isConsuming = false;
        finished && finished();
        return;
      }
      callback(res, next);
    };
    next();
  };
  this.isExeuting = function () {
    return isConsuming;
  };
}

const getBrowser = () => {
  let userAgent = navigator.userAgent;
  let name = '', version = '';
  if (/(Msie|Firefox|Opera|Chrome|Netscape)\D+(\d[\d.]*)/.test(userAgent)) {
    name = RegExp.$1;
    version = RegExp.$2;
  }
  if (/Version\D+(\d[\d.]*).*Safari/.test(userAgent)) {
    name = 'Safari';
    version = RegExp.$1;
  }
  return {
    name,
    version
  };
};

const getUUID = () => {
  return 'xxxx-xxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getProtocol = () => {
  let http = location.protocol;
  if(isEqual(http, 'file:')){
    http = 'http:';
  }
  let wsMap = {
    'http:': 'ws:',
    'https:': 'wss:'
  };
  let ws = wsMap[http];
  return { http, ws }
};

const sort = (arrs, callback) => {
  const len = arrs.length
	if(len < 2){
    return arrs;
  }
	for (let i = 0; i < len - 1; i++) {
		for (let j = i + 1; j < len; j++) {
			if (callback(arrs[j], arrs[i])) {
				[arrs[i], arrs[j]] = [arrs[j], arrs[i]]
			}
		}
	}
	return arrs
};
const quickSort = (arr, callback) => {
  if (arr.length < 2) {
      return arr;
  }
  let pivot = arr[0];
  let left = [];
  let right = [];
  for (let i = 1; i < arr.length; i++) {
      if (callback(arr[i], pivot)) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
  }
  return [...quickSort(left, callback), pivot, ...quickSort(right, callback)];
};
const find = (arrs, callback) => {
  let len = arrs.length;
  let index = -1;
  for(let i = 0; i < len; i++){
    let item = arrs[i];
    if(callback(item)){
      index = i;
      break;
    }
  }
  return index;
};
function isMobile() {
  let userAgent = navigator.userAgent, Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
  return Agents.some((i) => {
    return userAgent.includes(i)
  })
}
function isUniapp(){
  let userAgent = navigator.userAgent, Agents = ["uni-app"];
  return Agents.some((i) => {
    return userAgent.includes(i)
  })
}
function formatTime(time, fmt = 'yyyy-MM-dd hh:mm:ss') {
  let date = new Date(time);
  var o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    "S": date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
    x = x.replace(pattern, "$1,$2");
  return x;
}
/* 
matches = { count: 'num', time: 'date' }
*/
function formatProps(params, matches){
  let funcs = {
    num: numberWithCommas,
    date: formatTime
  };
  let convert = (obj, k, v) => {
    forEach(matches, (type, match) => {
      if(isInclude(k, match)){
        obj[`n_${k}`] = funcs[type](v)
      }
    });
  };
  let next = (obj) => {
    forEach(obj, (v, k) => {
      convert(obj, k, v);
    });
  };
  forEach(params, (value, key) => {
    if(isObject(value)){
      next(value);
    }else{
      convert(params, key, value);
    }
  });
}
function iterate(list, callback){
  let next = () => {
    let item = list.splice(0, 1);
    if(isEmpty(item)){
      return;
    }
    let isFinished = isEqual(list.length, 0);
    callback(item[0], next, isFinished);
  };
  next();
}
function getCurrentTime(){
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${year}-${month}-${day}`
}
function isPhoneNumber(num){
  var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
  return re.test(num);
}
function random(len = 256){
  return Math.floor(Math.random()*len)
}
function isChinese(text){
  return /.*[\u4e00-\u9fa5]+.*$/.test(text);
}
let isBase64 = (str) => {
  var regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  return regex.test(str);
};
function toBase64(str){
  return btoa(str);
}
function isMacBrowser() {
  let isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  let hasTouch = 'ontouchend' in document;
  return isMac && !hasTouch;
}
function formatTimetoHM(time) {
  var date = new Date(time);
  var hours = date.getHours().toString().padStart(2, '0');
  var minutes = date.getMinutes().toString().padStart(2, '0');
  return hours + ':' + minutes;
}
function isEmail(email){
	let reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return reg.test(email);
}
export default {
  Prosumer,
  Observer,
  isUndefined,
  isBoolean,
  isString,
  isObject,
  isArray,
  isFunction,
  stringify,
  parse,
  rename,
  extend,
  clone,
  deferred,
  Defer,
  forEach,
  templateFormat,
  isContain,
  noop,
  Cache,
  request,
  map,
  filter,
  uniq,
  some,
  isEqual,
  isEmpty,
  toJSON,
  isInclude,
  isNull,
  isNumber,
  toArray,
  Index,
  getBrowser,
  getUUID,
  requestNormal,
  getProtocol,
  sort,
  find,
  quickSort,
  isMobile,
  formatTime,
  numberWithCommas,
  formatProps,
  iterate,
  getCurrentTime,
  isPhoneNumber,
  random,
  isChinese,
  isBase64,
  toBase64,
  isMacBrowser,
  formatTimetoHM,
  isHighInclude,
  isUniapp,
  isEmail,
}