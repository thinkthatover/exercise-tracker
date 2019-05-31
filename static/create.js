//exercises are not re-ordering as I would like....

class Exercise {
  constructor() {
  }

  //primary keys must be ex_id + order for adding new containers.
  name = null;
  ex_id = null;
  description = null;
  weight = null;
  sets = null;
  reps = null;
  interval = null;
  order = null;
  div_id = null;
  ex_description = null;
  wo_description = null;



  display_min_container() {

    const parentdiv = $('#allExCont');
    //need to check if two of same exercises at same order


    jQuery('<div/>', {
      class: "row border rounded exCont " + this.order.toString(),
      id: "divid_" + this.div_id
    }).appendTo(parentdiv);


    $('<div class= "ex_id ' + this.ex_id + '" style=display:none; </div>').appendTo('#divid_' + this.div_id);
    $('<div class= "col border order">#' + this.order + '</div>').appendTo('#divid_' + this.div_id);
    $('<div class= "col border name">' + this.name + '</div>').appendTo('#divid_' + this.div_id);
    if (this.sets != null){
        $('<div class= "col border sets">' + this.sets + ' sets </div>').appendTo('#divid_' + this.div_id);
    }
    else{
        $('<div class= "col border sets">' + 1 + ' set </div>').appendTo('#divid_' + this.div_id);
    }
    $('<button id="btnex_' + this.div_id + '" onClick="edit_click(this.id, $(this).parent())"><img src="static/open-iconic/svg/list.svg"></button>').appendTo('#divid_' + this.div_id);


  }//display min_container

}//EXERCISE CLASS


$('#saveworkoutbutton').click(function(){

    var dictarray = [];
    var exdict = {};
    for (var i = 0; i < ex_array.length; i++){



        exdict = {
          exercise_id: ex_array[i].ex_id,
          description: ex_array[i].description,
          weight: ex_array[i].weight,
          sets: ex_array[i].sets,
          reps: ex_array[i].reps,
          set_interval: ex_array[i].interval,
          workoutorder: ex_array[i].order
        };
        dictarray.push(exdict);

    }
    var new_dict = JSON.stringify(dictarray);


    $.post('/saveworkout', {dictarray:new_dict,wo_id:woid}, function(data){
        console.log(data)
    })

});





//global exercise vars
var ex_array = [];
var edit_bool = true;
var desc_bool = true;
var woid = 0;
var divcount = 0;

//********************************
//LISTENER/HANDLER FUNCTIONS
//********************************
//for Filter, do xfinity tv filter method:


//***************
//button handlers
//***************


//add exercise to database (exercise_directory + muscle groups)
$('#saveexercise').click(function(){


    //input: exercise name, musclegroup
    //output: generated ex_id

    var mg1 = $('#groupselect').val();
    var name = $('#newExInput').val();

    //logic to prevent ppl from being sasshooles
    if ((name) && (name.length > 2)){

        $('#saveexercise').show();
        $('#addEx2Workout').text('ADD');


        $.get('/addexercise', {mg1:mg1,name:name}, function(data){
            //create new exercise object w/ passed exercise_id

            //clean up selectorGUI
            $('#ex_selector').hide();
            $('#saveexercise').hide();
            $('#exerciseselect').show();
            $('#exEditCont').show();
            //populate exercise editor+
            //create a new exercise object, push to array.
            $('#namecol').text(name);
            $('#ex_id').text(data[0]['exercise_id']);
            orderSelectHandler();
            $('#orderselect').val(ex_array.length+1);
        });
    }

    else{
        //get a proper input
        alert('Exercise names need to be >= 3 chars');
    }
});


//controls edit buttons on bottom containers
function edit_click(clickid){
    var div_id = clickid.slice(6);

    $('#ex_selector').hide();
    $('#addEx2Workout').text('Replace');
    $('#exEditCont').show();
    $('#removeEx2Workout').show();
    orderSelectHandler();


    for (var i = 0; i < ex_array.length; i++){
        if (div_id == ex_array[i].div_id){
        //populate edit container w/ values.
            $('#namecol').text(ex_array[i].name);
            $('#orderselect').val(ex_array[i].order);
            $('#setselect').val(ex_array[i].sets);
            $('#repInput').val(ex_array[i].reps);
            $('#weightInput').val(ex_array[i].weight);
            $('#fullDesc').val(ex_array[i].description);
            if (ex_array[i].interval){

                $('#intSec').val(ex_array[i].interval.toString().slice(-1));
                $('#intTenSec').val(ex_array[i].interval.toString().slice(-2,-1));
                $('#intMin').val(ex_array[i].interval.toString().slice(-4,-3));

            }
            $('#div_id').text(ex_array[i].div_id);
            $('#ex_id').text(ex_array[i].ex_id);
        }
    }
}


//delete an exercise from workout
$('#removeEx2Workout').click(function(){

    $('#exEditCont').hide();
    var div_id = $('#div_id').text();
    console.log(div_id);
    for (var i = 0; i < ex_array.length; i++){
        if (ex_array[i].div_id == div_id){
            ex_array.splice(i,1);
        }
    }

    GUIfresh();

});

 //empty everything from client
$('#cancelworkoutbutton').click(function(){

    $('#allExCont').empty();
    $('#ex_selector').hide();
    $('#addexercise').hide();
    $('#exEditCon').hide();
    $('#removeEx2Workout').hide();
    $('#exerciseselect').show();
    resetExEditCont();
    ex_array = [];

    editTopGui(false);
    edit_bool = true;
});


//Begin exercise addition flow
$(document).on('click','#addexercise', function(){
    //add existing exercise to workout
    $('#ex_selector').show();
    $('#saveexercise').hide();
    $('#newExInput').hide();
});


//new exercise from scratch
$(document).on('click','#newexercise', function(){

    if ($('#groupselect').val()) {
        $('#exerciseselect').hide();
        $('#newexercise').hide();
        $('#newExInput').hide();
        //show new exercise textbox, description
        $('#newExInput').show();
        $('#saveexercise').show();
        $('#ex_selector').show();
    }
    else{
        alert('please select a valid exercise group');
    }
});


//send selected exercise to GUI panel
$(document).on('click','#enterexercise', function(){

    //make sure selection is valid
    if (($('#groupselect').val()) && ($('#exerciseselect').val())){
        $('#ex_selector').hide();
        $('#addEx2Workout').text('ADD');
        var ex_id = $('#exerciseselect').val();
        //get exercise data from backend:
        //note this might be completely unecessary and I should just pull in the description data during the filter portion
        $.get('/getexercise', {ex_id:ex_id}, function( data) {
            $('#exEditCont').show();
            $('#namecol').text(data[0]['exercise_name']);
            $('#desc').text(data[0]['exercise_description']);
            $('#ex_id').text(data[0]['exercise_id']);
            $('#div_id').text("");

             //get the order set done
             orderSelectHandler();
             $('#orderselect').val(ex_array.length+1);

            //add in final select option, select it as default (different method to get selected)

        });//AJAX
    }
    else{
        alert('invalid selection');
    }
});


//edit workout handler
$('#editworkoutbutton').click(function(){
    //$('#saveasworkoutbutton').show();


    if (edit_bool) {

        $('#addexercise').show();
        //if edit has been pressed
    edit_bool = false;
     var wo_ID = $('#workoutselect').val();
     woid= wo_ID
     $.get("/start", {wo_ID:wo_ID, startbool:false}, function( data ){
         //create global exercise objects
         for (var i = 0; i< data.length; i++) {
             addExObject(data[i]);
         }

         //will need this bit in both edit workout and create workout
         //change top menu to edit screen save/cancel
         editTopGui(true);
     });

    }
});


//controls description text box drop down functionality
$('#desc').click(function(){
    if (desc_bool){
        $('input[name="fullDesc"]').val($('#desc').text());
        $('#fullDesc').val($('#desc').text());
        $('#exEditDesc').show();
        desc_bool = false;
    }
    else{
        $('#exEditDesc').hide();
        $('#desc').text($('#fullDesc').val());
        desc_bool = true;
    }
});


//stop adding an exercise to the workout
$('#cancelEx2Workout').click(function(){


    $('#exEditCont').hide();
    $('#removeEx2Workout').hide();
    $('#exerciseselect').show();
    resetExEditCont();
});


//adds exercise to GUI and ex_array
$('#addEx2Workout').click(function(){
    $('#removeEx2Workout').hide();
    $('#exEditCont').hide();


    //check if this is an edit or a new addition
    if ($('#div_id').text()){

        var p_did = $('#div_id').text();
        var p_order = $('#orderselect').val();
        //is an edit
        for (var i = 0; i < ex_array.length; i++){
            if ($('#div_id').text() == ex_array[i].div_id.toString()){
            ex_array[i].description = $('#fullDesc').val(),

            ex_array[i].sets= $('#setselect').val(),
            ex_array[i].reps= $('#repInput').val(),
            ex_array[i].weight= $('#weightInput').val(),
            ex_array[i].order= Number($('#orderselect').val()),
            ex_array[i].interval= $('#intMin').val() + ":" + $('#intTenSec').val() + $('#intSec').val();
            }
        }

    }
   //CLEAN THIS UP: ACCOUNT FOR NULL VALUES


    else{
        //new addition to workout
        var dict = {
            exercise_name: $('#namecol').text(),
            exercise_id: Number($('#ex_id').text()),
            exercise_description: $('#fullDesc').val(),
            sets: $('#setselect').val(),
            reps: $('#repInput').val(),
            weight: $('#weightInput').val(),
            workoutorder: Number($('#orderselect').val()),
            set_interval: $('#intMin').val() + ":" + $('#intTenSec').val() + $('#intSec').val()
        };

        var exob = addExObject(dict);
        var p_did = exob.div_id
        var p_order = exob.order

    }

    if (ex_array.length >= 1){
        orderExs(p_did, p_order);

        GUIfresh();



    }
});


//*******************
//HELPER FUNCTIONS
//*******************

//changes value of orders on exercise object to start at 0 and continue up.
function ordercheck(){
//always call after orderExs to properly handle order conflicts when adding/editing exercises.
    for (var i = 0; i < ex_array.length; i++){
        if (ex_array[i].order != i+1) {
            ex_array[i].order = i+1;
        }
    }

    ex_array.sort(function(a, b){
        return a.order-b.order;
    });
}


//after change in workout routine, reorders ex_array[ind].order values around changed/added exercise
function orderExs(p_did, p_order){

    //check for duplicates
    for (var i = 0; i < ex_array.length; i++){
        if ((ex_array[i].order == p_order) && (ex_array[i].div_id != p_did)){
            ex_array[i].order++;
            p_order = ex_array[i].order;
            p_did = ex_array[i].div_id;
        }
    }

            //sort exercise array
        ex_array.sort(function(a, b){
            return a.order-b.order;
        });

}

//need to refresh bottom GUI when edit's occur.
function GUIfresh(){
    ordercheck();
    resetExEditCont();

    $('#allExCont').empty();
    for (var j = 0; j< ex_array.length; j++){
        ex_array[j].display_min_container();
    }
}


function addExObject(dict){
    var exobject = new Exercise();
    //fillemup
    exobject.name = dict["exercise_name"];
    exobject.ex_id = Number(dict["exercise_id"]);
    exobject.description = dict["exercise_description"];
    exobject.sets = dict["sets"];
    exobject.reps = dict["reps"];
    exobject.weight = dict["weight"];
    exobject.order = dict["workoutorder"];
    exobject.interval = dict["set_interval"];
    exobject.div_id = divcount;
    divcount++;

    //update GUI
    exobject.display_min_container();

    //update ex_array
    ex_array.push(exobject);
    ex_array.sort(function(a, b){
        return a.order-b.order;
    });

    return exobject;
}

//switches topgui to appropriate GUI elements
function editTopGui(bool){
    //true = edit a workout, false = cancel editing
    if (bool) {
        $('#workoutselect').hide();
        $('#editworkoutbutton').hide();
        $('#deleteworkoutbutton').hide();

        $('#workoutlabel').text($('#workoutselect option:selected').text());
        $('#workoutlabel').show();
        $('#saveworkoutbutton').show();
        $('#cancelworkoutbutton').show();

    }
    else{
        $('#workoutselect').show();
        $('#editworkoutbutton').show();
        $('#deleteworkoutbutton').show();
        $('#workoutlabel').hide();
        $('#saveasworkoutbutton').hide();
        $('#saveworkoutbutton').hide();
        $('#cancelworkoutbutton').hide();
    }
}

$('#saveasworkoutbutton').click(function(){

});





//removes select options
//need to use document.getElementById instead of jquery for this input
function removeOptions(selectbox, save=0){
    var i;
    for(i = selectbox.length - 1 ; i >= 1 + save ; i--)
    {
        selectbox.remove(i);
    }
}

//refreshes order select options when adding an exercise in Exercise Edit GUI
function orderSelectHandler(a = 0){
    //a is to offset selections when creating
    removeOptions(document.getElementById('orderselect'));
    //+1 because exercise object instantiated after exercise saved to workout
    var exlen = ex_array.length+1;
    $('#ordernum').text(exlen);
    for (var i=1; i <= exlen; i++){
        $('#orderselect').append($('<option>',{value:i,text:i}));
    }
}


function timeToNumber(time){
//converts interval times to seconds for use w/ easytimer

      var time_array = time.split(':');
      var seconds = Number(time_array[time_array.length-1]);
      seconds = seconds + 60*Number(time_array[time_array.length-2]);
      return seconds;

}


//******************************
//Selection->button GUI listeners
//******************************

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[id="workoutselect"]').onchange=changeButtonHandler;
    document.querySelector('select[id="groupselect"]').onchange=exFilterHandler;
    document.querySelector('select[id="exerciseselect"]').onchange=addNameSelectHandler;
},false);



function addNameSelectHandler(event){
//checks exercise container for add exercise option
    if (event.target.value == "new_ex"){
    //change 'ADD button to NEW'
    $('#enterexercise').hide();
    $('#newexercise').show();
}
else{
    $('#enterexercise').show();
    $('#newexercise').hide();
}

}


//fills exercise selector by selected muscle group filter
function exFilterHandler(event){

    if (event.target.value != "nope"){
        //renable buttons
        $('#enterexercise').attr("disabled",false);
        $('#newexercise').attr("disabled",false);
        var first = event.target.value;
         $.get("/fillselect", {mg_id:first}, function( data ){
             if (data.length != 0) {
                 //empty then fill exercise selector
                 var ex_sel = $('#exerciseselect');
                 removeOptions(document.getElementById("exerciseselect"),1);

                 for (var i = 0; i < data.length; i++)
                 {
                     ex_sel.append($('<option>', {value : data[i]['exercise_id']})
                        .text(data[i]['exercise_name']));
                 }
             }
             //ajax failure
             else{
                 console.log('Your AJAX failed or the workout doesnt have any attributes');
             }
         });
    }
}

function changeButtonHandler(event) {
    if (event.target.value != "New Workout"){
    //show edit button
        $('#editdiv').show();
        $('#startdiv').hide();
    }
    else{
    //show create button
        $('#editdiv').hide();
        $('#startdiv').show();
    }
}

//resets GUI exercise editor.
function resetExEditCont() {
    $('#repInput').val("");
    $('#weightInput').val("");
    $('#intMin').val(0);
    $('#intTenSec').val(0);
    $('#intSec').val(0);
}

//resets top level container
function resetPage (){

    $('#addexercise').hide();
    $('#exSelCont').hide();
    $('#workoutselect').show();
}

//******************************
//TODOO
//******************************


$('#deleteworkoutbutton').click(function(){
    console.log('sureyouwannadelete?');
});


//start flow for workout creation
$('#createworkoutbutton').click(function(){

    //create a name for workout
    $('#workoutselect').hide();
    $('#createtextbox').show();
    $('#createworkoutbutton').hide();
    $('#savenewworkoutbutton').show();

//goes to savenewworkoutbutton
//put everything after this in the AJAX


});

$('#savenewworkoutbutton').click(function(){
    var wo_name = $('#createtextbox').val();

    //add an ajax check if they have a workout with the same name

    $.get("/createnewroutine", {wo_name:wo_name}, function( data ){
        console.log(data[0]['workout_id']);
        woid = data[0]['workout_id'];
        $('#addexercise').show();
        $('#exSelCont').show();
        editTopGui(true);
        $('#createtextbox').hide();
        $('#workoutlabel').text($('#createtextbox').val());
        $('#savenewworkoutbutton').hide();
        $('#editdiv').show();
        $('#startdiv').hide();


    });

    //Do ajax later


});