import utils from './utils';
import { EventSourcePolyfill } from 'event-source-polyfill';

function EventSent(url, options){
  let { onMessage, onError, headers } = options;
  let events = {
    msg: onMessage,
    finish: onMessage,
  }
  let es = {};
  let isReceiving = false;
  function connnect(){
    es = new EventSourcePolyfill(url, { headers });
    let timer = setTimeout(() => {
      console.log('超时啦')
      clearTimeout(timer)
      if(!isReceiving){
        console.log('重连啦')
        es.close();
        connnect();
      }
    }, 1000 * 29)

    function onReceived(e){
      // console.log('onreceived', e)
      clearTimeout(timer);
      let message = JSON.parse(e.data);
      let { type, is_finished, payload } = message;
      if(is_finished){
        es.close();
        isReceiving = !is_finished;
      }
      let event = events[type] || utils.noop;
      event(payload, is_finished);
    }
    function onError(e){
      console.log('onerror', e)
      es.close();
      isReceiving = false;
      clearTimeout(timer);
      console.log('error', e)
    }

    es.addEventListener('message', onReceived);
    es.addEventListener('error', onError)
  }
  connnect();
  return es;
}

export default EventSent;