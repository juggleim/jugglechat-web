export default function(){
  let times = 0;
  function countTime() {
    var hh = parseInt(times / 60 / 60 );
    hh = hh < 10 ? '0' + hh : hh;
    var mm = parseInt(times / 60 % 60);
    mm = mm < 10 ? '0' + mm : mm;
    var ss = parseInt(times % 60);
    ss = ss < 10 ? '0' + ss : ss;
    let seconds =  hh + ':' + mm + ':' + ss;
    times++;
    return seconds;
  }

  let interval = 0;
  let start = (callback) => {
    interval = setInterval(() => {
      let time = countTime();
      callback({ time });
    }, 1000);
    let time = countTime();
    callback({ time });
  };

  let stop = () => {
    times = 0;
    clearInterval(interval);
  };

  return { start, stop };
}