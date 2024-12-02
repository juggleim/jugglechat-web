export default function CallCore(state){

  let onHangup = () => {
    state.isShowCall = false;
  }
  return { 
    onHangup
  }
}

