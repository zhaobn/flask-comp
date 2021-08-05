from functools import wraps
import json
import random
import string

from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request
from flask import Response
from flask import session
from flask import url_for

from app import tasks
from app.utils.task_register import TasksError
from .models import Participant
from .models import TasksCompleteError
from .models import DemoExperiment  # Import Your Task model here

from . import main
# import config
# from config import DEBUG
'''

Explanation
-----------

All requests should be sent to the root url ('/')
This is managed by the function task(), which loads a Participant
from the database based on a session identifier.

The Participant model keeps track of the participant state
and advances through those states with each request to '/'.

The @tasks.register decorator matches a task to a state declared in
TASK_ORDER variable in models.py. Also, specify an HTTP method to constrain
access to each function to a particular method (only one allowed, unlike Flask views).

Task functions have access to all Flask methods (request, response).

The registered tasks (currently) do the following:

1) On first load, return 'welcome.html'. This should be an introduction page to the task.
2) On second load, return the task ('task.html').
3) Third load should be submission of task data via AJAX. This will return a JSON object
    with 'completed' set to True (if valid) or False (if invalid). If a completed token, 
    e.g. for Mechanical Turk, is required, return this in the True case.

4) Any further attempts to refresh the page should return 'task_done.html'.

To allow testing, after the first return of 'task_done.html', the user session is cleared
(otherwise, you will not be able to access the page again without clearing browser cookies).
THIS LINE SHOULD BE REMOVED IN PRODUCTION.


'''

def generate_completed_token():
    ''' Generates a unique completed token. '''
    token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return token

@tasks.register('STARTED', method='GET')
def start(participant):
    return render_template('welcome.html')

@tasks.register('GET_TASK', method='GET')
def get_task(participant):
    return render_template('task.html')

@tasks.register('POST_RESULTS', method='POST')
def tasks_completed(participant):
    try:
        print("hello world")

        result = json.loads(request.data)
        print(result)
        print(participant)
        result = {key: str(value) for key, value in result.items()}
        task = DemoExperiment(participant=participant, **result)
        # JSON data sent by AJAX/fetch should match fields specified in YourTask model
        # print(task)

    except Exception as e:
        print(e)
        return jsonify({'completed': False})

    # And here, generate JSON response

    resp = {
        'completed': True,
        'completed_token': generate_completed_token() # Add a function to generate a token e.g. for Mechanical Turk
        }


    return jsonify(resp)
    #return render_template('complete.html',
    #                       first_ting=jsonify(resp),
    #                       resp=resp)





@main.route('/', methods=['GET', 'POST'])
def task():
    '''
    Main task dispatching function.

    This should be the entry point to the entire task process.

    Tracks participant state in Participant model.

    Dispatches to function decorated with

    @task.register('<PARTICIPANT-STATE>')
    def func():
        pass

    Can also check method in @task.register by
    passing method='<METHOD>' as kwarg (as in Flask decorator)
    '''

    # Look up participant 
    participant = Participant.get(id=session.sid)
    
    # If participant has not visited site, create participant
    if not participant:
        participant = Participant(id=session.sid, hashed_ip_address=request.remote_addr)
    
    # Advance participant state to next task
    try:
        participant.advance_state()
    except TasksCompleteError:
        # ///////////////////////
        session.clear() # FOR TESTING ONLY. Remove this line if not testing!!!!!!!!!!!!
        # ///////////////////////
        
        # If cannot, return Completed page
        return render_template('previously_completed.html') # Page returned if task is already done

    try:
        # Return call to current task function,
        # passing in request method for validation in getting task
        # and participant object
        return tasks(participant.current_state, request.method)(participant)
    except TasksError:
        return 'There was an error.'
