import im from '../../common/im';

export default function CallCore(state){
  let juggleCall = im.getRTCEngine();

  let onHangup = ({ callId, isOneSelf }) => {
    state.isShowCall = false;
    let session = juggleCall.getSession({ callId });
    if(session && isOneSelf){
      session.hangup();
    }
  }
  return { 
    onHangup
  }
}

