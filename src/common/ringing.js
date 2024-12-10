export default function(){
  let audio = new Audio();
  audio.src = '/2472.mp3';
  audio.loop = true;
  let play = () => {
    audio.play();
  };
  let pause = () => {
    audio.pause()
  };
  return {
    play,
    pause,
  };
}