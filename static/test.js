function timeToNumber(time){
//converts interval times to seconds for use w/ easytimer

      var time_array = time.split(':');

      var seconds = Number(time_array[time_array.length-1]);
      seconds = seconds + 60*Number(time_array[time_array.length-2]);
      return seconds;

}


var timer1 = $('#one span');
var timer2 = $('#two span');

var interval = "00:10"
var inter = timeToNumber(interval);
console.log(inter);

//intialize timers
var time2 = new easytimer.Timer();
var timer = new easytimer.Timer();

timer.start({countdown: true, startValues: {seconds: inter}});
timer.addEventListener('secondsUpdated', function (e) {
    timer1.text(timer.getTimeValues().toString(['minutes','seconds']));
});
timer.addEventListener('targetAchieved', function (e) {
      timer1.css('color', 'red');
      time2.start();
      time2.addEventListener('secondsUpdated', function (f) {
            timer1.text(time2.getTimeValues().toString(['minutes','seconds']))});
});



var checkList = document.getElementById('list1');
var items = document.getElementById('items');
        checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            if (items.classList.contains('visible')){
                items.classList.remove('visible');
                items.style.display = "none";
            }

            else{
                items.classList.add('visible');
                items.style.display = "block";
            }


        }

        items.onblur = function(evt) {
            items.classList.remove('visible');
        }