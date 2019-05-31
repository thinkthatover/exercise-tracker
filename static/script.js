//REGISTER JS
//check username in database
function checkname() {
    //get field
    var userfield = document.getElementById('username');
    $('#username-alert').hide();
    var username = userfield.value;

    //check username length
    if (username.length < 1){
        finalcheck(false);
        userfield.setCustomValidity("error");
        $('#userlength-alert').fadeIn();
        return false;
    }

    //check if username exists via AJAX
    else {
        $.get("/check", {username:username}, function( data ){
        var avail = JSON.parse(data);

        //username unavailable
        if (!(avail)) {
          finalcheck(false);
          $('#username-alert').fadeIn();
          userfield.setCustomValidity("error");
          return false;
    }
        //username is available
        else {
          finalcheck(true);
          userfield.setCustomValidity('');
          return true;
        }

        });
    }
}

//confirm password entered correctly both times
function checkpass() {
   $('#passconfirm-alert').hide();
   $('#passlength-alert').hide();

  var pass = document.getElementsByName('password')[0];
  var check = document.getElementsByName('confirmation')[0];
//check length of password
  if (pass.value.length < 1){
     $('#passlength-alert').fadeIn();
     pass.setCustomValidity('f');
     check.setCustomValidity('f');
     return false;
  }

//check if passwords match
  if (pass.value != check.value) {
    $('#passconfirm-alert').fadeIn();
    pass.setCustomValidity('f');
    check.setCustomValidity('f');
    return false;
  }

  else {
    pass.setCustomValidity('');
    check.setCustomValidity('');
    return true;
  }

}

function finalcheck (u) {
  var p = checkpass();
  form.classList.add('was-validated');
  var a=$('firstname');
  var b=$('lastname');
  var c=$('DOB1');

    if (!(p && u && a && b && c))
  {
    alert('Unable to Process - Please review highlighted fields');
  }

  else {
    form.submit();
  }
}

//logic for submit listener
const form = document.querySelector('form');
form.addEventListener('submit', event => {
  event.preventDefault();
  event.stopPropagation();
  checkname();

})



