//global to do:
//redirect finished workout to new webpage
//pause requires pressing it twice first time
// make urls in descriptions into hyperlinks.


//global exercise vars
var ex_array = [];
var session_id;
var set_counter = 0;
var set_limit = 0;
var global_order = 0;
var timebool = true;
var int_timer = new easytimer.Timer();
var ex_timer = new easytimer.Timer();
var timer = new easytimer.Timer();


class Exercise {
  constructor() {
  }

  user_id = null;
  wo_id = null;
  name = null;
  ex_id = null;
  description = null;
  weight = null;
  sets = null;
  reps = null;
  interval = null;
  order = null;




  display_min_container(parentdiv) {
    //create future exercise container:
    jQuery('<div/>', {
      class: "row border rounded",
      id: "ex_" + this.order
    }).appendTo(parentdiv);

    //fill container
    $('<div class= "col border"> #' + this.order + '<div>').appendTo('#ex_'+ this.order);
    $('<div class= "col border">' + this.name + '<div>').appendTo('#ex_'+ this.order);
    $('<div class= "col border">' + this.sets + ' sets <div>').appendTo('#ex_'+ this.order);

  }//display min_container

  populate_exercise() {
    //hide min container
    $('#ex_' + this.order).hide();

    var namediv = $('#ex_name');
    var timediv = $('#ex_time');


    //put the labels on:
    namediv.text(this.name);
    timediv.text("0:00");

    if (this.interval) {
      //start timers
      timediv.css('color', 'black');
    int_timer.start({countdown: true, startValues: {seconds: this.interval}});
    int_timer.addEventListener('secondsUpdated', function (e) {
      timediv.text(int_timer.getTimeValues().toString(['minutes','seconds']));
    });
    int_timer.addEventListener('targetAchieved', function (e) {
      timediv.css('color', 'red');
      ex_timer.start();
      timebool = false;
      ex_timer.addEventListener('secondsUpdated', function (f) {
            timediv.text(ex_timer.getTimeValues().toString(['minutes','seconds']))});
    });
    }
    else {
      timediv.css('color', 'red');
      ex_timer.start();
      timebool = false;
      ex_timer.addEventListener('secondsUpdated', function (f) {
            timediv.text(ex_timer.getTimeValues().toString(['minutes','seconds']))});
    }


//GET & FORMAT DESCRIPTION
    if (this.description) {
      //need to check for youtube links, want to provide a clickable url for user to interact w/.
      $('#ex_description').text(this.description);
    }
    else{
      $('#ex_description').text("No Description");
    }





    //***************
    //CREATE SELECTIONS
    //***************
    if (this.weight){

      var select_w = $('#cweight');
      select_w.find('option').remove().end();

      //gets a lower bound for weight array
      var lowerbound = this.weight-25;
      if (lowerbound < 0){
        lowerbound = 0;
      }
      var upperbound = this.weight+25;

      //populate array
      var weight_array = [];
      for (var i = lowerbound; i < upperbound; i = i+5){
        weight_array.push(i.toString());
      }

      //populate select w/ array
      for (var j = 0; j < weight_array.length; j++){
        var opt = document.createElement("option");
        opt.value= weight_array[j];
        opt.innerHTML = weight_array[j].toString() + "lbs";
        select_w.append(opt);

      }
    $('#cweight option[value="' + this.weight + '"]').attr("selected",true);
    }
    else {
      $('#ex_weightselect').hide()
    }



    if (this.reps){

      //not sure if i even need rep_array tbh

      var select_r = $('#creps');
      //clean it

      select_r.find('option').remove().end();



      //populate select
      for (var k = 0; k < this.reps + 5; k++){
        var opt1 = document.createElement("option");
        opt1.value=k;
        opt1.innerHTML = k.toString();
        select_r.append(opt1);
      }

      //set default option
      $('#creps option[value="' + this.reps + '"]').attr("selected",true);

    }//reps
    else{
      $('#ex_repselect').hide();
    }

    //update set label
    var setdiv = $('#ex_set');
    if (this.sets){
      setdiv.text("1" + "/" + this.sets);
    }
    else{
      setdiv.text("1 set");
    }


    //update global values
    set_counter = 1;
    set_limit = this.sets;
    global_order = this.order;

  }//populate_exercise method


  recordset() {
    var cweight = $('#cweight').val()
    var ctime = $('#ex_time').text();
    var creps = $('#creps').val();
    var sendata = {reps:creps, weight:cweight, session_id:session_id, ex_id:this.ex_id, set:set_counter, set_time:ctime};
     $.post("/recordset", sendata, function(){});

  }//send method


}//EXERCISE CLASS




//**********************************
//EVENT HANDLERS & ONCLICK FUNCTIONS
//**********************************



function startWorkout () {
  //gets data & starts session from backend
  //sends data to populate exercise objects, update GUI and "start" the workout.

  var wo_ID = $("#workoutselect").find("option:selected").val();
  var wo_Name = $("#workoutselect").find("option:selected").text();

  if (wo_Name != "Select workout"){
    //send wo_ID to backend to create new session
    $.get("/start", {wo_ID:wo_ID, startbool:true}, function( data ){

      //pull apart session_id and routine
      session_id = data[0][0]['session_id'];
      const routine = data[1];

      //make exercise objects
      makeObjectArray(routine);

      //change start container UI to reflect active workout
      var lbl1 = $("<label></label>").text(wo_Name.toUpperCase());
      var timer1 = $("<strong id='workout_timer'><strong>").text('00:00:00');


      $("#workoutselect").detach();
      $("#startbutton").detach();
      $("#selectdiv").prepend(lbl1);
      $("#startdiv").prepend(timer1);

      timer.start();
      timer.addEventListener('secondsUpdated', function (e) {
          timer1.html(timer.getTimeValues().toString());
      });

      //Create/Display minimized exercises
      var bigdiv = $('#bigdiv');
      for (var j = 0; j < ex_array.length; j++){
        ex_array[j].display_min_container(bigdiv);
      }

      //create/hide finish div
      jQuery('<div/>', {
      class: "row border rounded",
      id: "finishdiv"
      }).appendTo(bigdiv).hide();
      $('<button type="button" id="finishbutton" onclick="endWorkout()">End Workout</div>').appendTo('#finishdiv');

      //show current exercise, start tracking
      $('#currentexercise').show();
      $('#pausediv').show();
      ex_array[0].populate_exercise();

    });//AJAX
}}//startWorkout



//sends final time to backend.
//why is this necessary?? seems like it's nice to tie things up, but doesn't add any functionality (unless I start counting stretching)
function endWorkout() {
  //need to determine final time(can do on backend)
  //need to stop clock
  timer.stop();
  const total_time= $('#workout_timer').text()

  $.post("/endWorkout", {session_id:session_id, time:total_time}, function(){
    location.href = "/practice.html";
     });
}


//pause / resume workout
$('#pausebutton').click(function(){

  //to pause
  if ($('#pausebutton').text() == "pause"){
    $('#pausebutton').text("resume");
    //stop timers
    timer.pause();

    if (timebool){
      int_timer.pause();
    }
    else{
      ex_timer.pause();
    }
  }

  //to resume
  else{
    $('#pausebutton').text("pause");
    timer.start();

    if (timebool){
      int_timer.start();
    }
    else{
      ex_timer.start();
    }



  }
})

//event handler for set submission
$('#submitset').click(function () {

  //don't let them submit if workout paused or still interval time
  if($('#pausebutton').text() == 'resume') {
    return true;
  }

    //reset clock stuff
    ex_timer.stop();
    timebool = true;
    $('#ex_time').css('color', 'black');



  //send data to backend

  ex_array[(global_order-1)].recordset();

  //end of set
  if (set_counter >= set_limit){




    //start next exercise or end workout
    if (global_order != ex_array.length){
      //kill int timer
      int_timer.stop();

      //go to next exercise
      ex_array[(global_order)].populate_exercise();
    }

    //end workout!
    else{
      int_timer.stop();
      //want to show a finish button, hide exercise container, and present a stretch timer.
      $('#currentexercise').hide();
      $('#finishdiv').show();
    }

  }
  //midset
  else{

    //update counters
    set_counter++;
    int_timer.reset();
    $('#ex_set').text(set_counter + "/" + set_limit);


  }

});

//display/hide description when you press name of exercise
$('#ex_name').click(function (){
  if ($("#desc_container").is(":visible")){
    $("#desc_container").hide();
  }
  else{
    $("#desc_container").show();
  }


})

//**********************
//HELPER FUNCTIONS
//**********************


function timeToNumber(time){
//converts interval times to seconds for use w/ easytimer

      var time_array = time.split(':');

      var seconds = Number(time_array[time_array.length-1]);
      seconds = seconds + 60*Number(time_array[time_array.length-2]);
      return seconds;

}




function makeObjectArray(wo_data) {
//create exercise array,
//loop, make exercise objects, fill array
//you never made exercise objects dipshit

  //make object array

  for (var i = 0; i< wo_data.length; i++) {
      //instantiate objects
      var exobject = new Exercise();
      //fillemup
      exobject.name = wo_data[i]["exercise_name"];
      exobject.ex_id = wo_data[i]["exercise_id"];
      exobject.description = wo_data[i]["exercise_description"];
      exobject.sets = wo_data[i]["sets"];
      exobject.reps = wo_data[i]["reps"];
      exobject.weight = wo_data[i]["weight"];
      exobject.order = wo_data[i]["workoutorder"];

      if (wo_data[i]["set_interval"]){
        exobject.interval = timeToNumber(wo_data[i]["set_interval"]);
      }
      //fill array w/ new object
      ex_array.push(exobject);
  }
      ex_array.sort(function(a, b){
        return a.order-b.order;
      });

}


//timer from https://albert-gonzalez.github.io/easytimer.js/