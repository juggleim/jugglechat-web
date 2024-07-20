import utils from "./utils";
  /*
  _EmitterEvents = {
    name: [event1, event2, ...]
  }
*/
let _EmitterEvents = {};
let $on = (name, event) => {
  let events = _EmitterEvents[name] || [];
  events.push(event);
  let eventObj = {};
  eventObj[name] = events;
  utils.extend(_EmitterEvents, eventObj);
}

let $off = (name) => {
  delete _EmitterEvents[name];
}

let $emit = (name, data) => {
  let events = _EmitterEvents[name] || [];
  utils.forEach(events, (event) => {
    event(data);
  });
}

let $clear = () => {
  utils.forEach(_EmitterEvents, (event, name) => {
    delete _EmitterEvents[name];
  });
}
export default {
  $on,
  $off,
  $emit,
  $clear
}