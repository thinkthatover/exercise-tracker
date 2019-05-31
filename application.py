#EXERCISE APP

import os
import json

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///exercise.db")

#c = db.cursor()




#****************
#WORKOUT ROUTES
#****************


#index is exercise screen, get exercises associated w/ ID
@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    if request.method == "GET":
        """Show available workouts"""
        wo_db = db.execute("SELECT workout_id, workout_name FROM workout_routines WHERE id=:idd", idd=session["user_id"])
        workouts = []
        for dct in wo_db:
            workouts.append((dct['workout_id'],dct['workout_name']))
        return render_template("index.html", workouts=workouts)
    if request.method == "POST":
        #end of workout.1
        pass


#get a workout, and start a new session if exercising
@app.route("/start", methods=["GET"])
@login_required
def start():
    """create new entry in session history, return exercise data """

    wo_ID = request.args.get('wo_ID');

    #pull exercise data
    routine = db.execute("SELECT * FROM workout_exercises JOIN exercise_directory ON workout_exercises.exercise_id = exercise_directory.exercise_id \
    WHERE workout_id=:wo_ID ORDER BY workoutorder ASC", wo_ID=wo_ID)

    #if recording a workout
    if request.args.get('startbool') == 'true':
        db.execute('INSERT INTO session_history(id,workout_id) VALUES (:idd,:workout_id)' , \
        idd=session["user_id"], workout_id=wo_ID)
        ex_sesh = db.execute('SELECT session_id FROM session_history WHERE id=:idd ORDER BY session_id DESC LIMIT 1', idd=session["user_id"])
        data = [ex_sesh, routine]
        return jsonify(data)

    #only getting info for a workout (create.html)
    else:
        return jsonify(routine)

    #create new entry



    #pull session id


#finish a workout
@app.route("/endWorkout", methods=["POST"])
@login_required
def finish():

    session_id = request.form.get('session_id')
    time = request.form.get('time')
    db.execute("UPDATE session_history SET elapsed_time=:time WHERE session_id=:session_id", time=time, session_id=session_id)
    flash('Workout Complete!')

    return render_template("/index.html")


@app.route("/recordset", methods=["POST"])
@login_required
def recordset():

    session_id = request.form.get('session_id')
    exercise_id = request.form.get('ex_id')

    #need some logic here for if there's no sets/reps/weight/interval time
    #ie: set to "NULL" for DB
    reps = request.form.get('reps')
    sets = request.form.get('set')
    weight = request.form.get('weight')
    set_time = request.form.get('set_time')


    db.execute("INSERT INTO exercise_history(session_id,exercise_id,reps_done,weight_done,set_num,set_time) \
    VALUES(:session_id,:exercise_id,:reps,:weight,:sets,:set_time)", session_id=session_id, exercise_id=exercise_id, \
    weight=weight, reps=reps, sets=sets, set_time=set_time)
    return jsonify(True)



#****************
#CREATE EXERCISE ROUTES
#****************


#fill exercise select when adding a new exercise to workout
@app.route("/fillselect", methods=["GET"])
@login_required
def fill():

    mg = request.args.get('mg_id')
    ex1 = db.execute("SELECT exercise_id, exercise_name FROM exercise_directory WHERE mg_1=:mg", mg=mg)
    data = ex1
    return jsonify(data)


#get the exercise data for selected exercise
@app.route("/getexercise", methods=["GET"])
@login_required
def getexercise():
    ex_id = request.args.get('ex_id')
    ex = db.execute("SELECT * FROM exercise_directory WHERE exercise_id=:ex_id", ex_id=ex_id)

    return jsonify(ex)

#add a new exercise to exercise_directory
@app.route("/addexercise", methods=["GET"])
@login_required
def addexercise():
    ex_name = request.args.get('name')
    mg1 = request.args.get('mg1')
    ##add extra muslce groups later

    db.execute('INSERT INTO exercise_directory (exercise_name, mg_1) VALUES(:ex_name, :mg1)', \
    ex_name=ex_name, mg1=mg1)
    ex_id = db.execute('SELECT exercise_id FROM exercise_directory ORDER BY exercise_id DESC LIMIT 1')


    return jsonify(ex_id)

@app.route("/createnewroutine", methods=["GET"])
@login_required
def createnewroutine():
    wo_name = request.args.get('wo_name')
    db.execute('INSERT INTO workout_routines (workout_name, id) VALUES(:workout_name, :idd)', \
    workout_name=wo_name, idd=session["user_id"])

    #adda check where you verify workoutname on JS side.
    wo_id = db.execute('SELECT workout_id FROM workout_routines ORDER BY workout_id DESC LIMIT 1')

    return jsonify(wo_id)

@app.route("/saveworkout", methods=["POST"])
@login_required
def saveworkout():

    wo_id = int(request.form.get('wo_id'))
    dictarray = json.loads(request.form.get('dictarray'))
    #delete all previous records
    db.execute('DELETE FROM workout_exercises WHERE workout_id=:wo_id', wo_id=wo_id)

    #add new records
    for ex in dictarray:
        print(ex)

        db.execute('INSERT INTO workout_exercises (workout_id, workoutorder, sets, reps, set_interval, weight, exercise_id, \
        description) VALUES (:workout_id, :workoutorder, :sets, :reps, :set_interval, :weight, :exercise_id, :description)', \
        workout_id=wo_id, workoutorder=ex['workoutorder'], sets=ex['sets'], reps=ex['reps'], set_interval=ex['set_interval'], \
        weight=ex['weight'], exercise_id=ex['exercise_id'], description=ex['description'])

    check = db.execute('SELECT * FROM workout_exercises WHERE workout_id=:wo_id', wo_id=wo_id)

    if len(check) > 0:
        return jsonify("it'sdonesun")
    else:
        return jsonify("notyettt")



#gets all associated workouts with your account, or makes a new workout if POST
#should I just split these up? No it's post because I'm POSTING that info......
@app.route("/createroutine", methods=["GET", "POST"])
@login_required
def createroutine():
    """Show available workouts"""
    if request.method == "GET":
    #default page
        wo_db = db.execute("SELECT workout_id, workout_name FROM workout_routines WHERE id=:idd", idd=session["user_id"])
        workouts = []

        for dct in wo_db:
            workouts.append((dct['workout_id'],dct['workout_name']))
        groups = db.execute("Select * FROM muscle_groups")
        muscle_groups =[]
        for dct in groups:
            muscle_groups.append((dct['mg_id'],dct['mg_name']))
        return render_template('/createroutine.html', workouts=workouts, muscle_groups=muscle_groups)

    #saving a new workout
    else:

    #TO-DO
    #=******************



    #after save, redirect to same page
        wo_db = db.execute("SELECT workout_id, workout_name FROM workout_routines WHERE id=:idd", idd=session["user_id"])
        workouts = []
        for dct in wo_db:
            workouts.append((dct['workout_id'],dct['workout_name']))

        return render_template('/createroutine.html', workouts=workouts)



#route to fuckaroundwith
@app.route("/practice", methods=["GET"])
@login_required
def practice():

    return render_template("/practice.html")


#****************
#ACCOUNT FUNCTIONS
#****************

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")




@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":

        regelements = ["firstname", "lastname", "DOB1", "password", "confirmation", "username"]

        #generic check all form elements
        for formel in regelements:
            if not request.form.get(formel):
                apol = "please enter " + formel
                return apology(apol, 400)

        if request.form.get("confirmation") != request.form.get("password"):
            return apology("password entries did not match", 400)

        #check if trainer, format for DB
        if request.form.get("trainercheck") == "":
            trainer = "FALSE"
        else:
            trainer = "TRUE"


        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if rows:
            return apology("Username already taken", 400)


        #generate hash
        hpass = generate_password_hash(request.form.get("password"))
        #add username, hashed pass to database
        db.execute("INSERT INTO users(firstname,lastname,username,DOB,hash,trainer) \
                             VALUES(:firstname,:lastname,:username,:DOB,:password,:train)", \
        firstname=request.form.get("firstname"), lastname=request.form.get("lastname"), \
        username=request.form.get("username"), DOB=request.form.get("DOB1"), password=hpass, train=trainer)

        flash('User successfully added!')
        # Redirect user to home page
        return redirect("/")


    #taken here from a link GET
    else:
        return render_template("register.html")


@app.route("/check", methods=["GET"])
def check():
    username = request.args.get('username')
    """Return true if username available, else false, in JSON format"""
    exists = db.execute("SELECT id FROM users WHERE username=:username", username=username)

    if len(username) > 1 and not exists:

        return jsonify(True)
    else:
        return jsonify(False)


def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)
