export default function(){
  let play = () => {
    document.querySelector('#ringing').play()
  };
  let pause = () => {
    document.querySelector('#ringing').pause()
  };
  return {
    play,
    pause,
  };
}