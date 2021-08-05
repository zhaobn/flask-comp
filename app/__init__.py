from flask import Flask

from flask_script import Manager, Command, Shell
from flask_session import Session
from pony.flask import Pony
from pony.orm import Database

from .utils.task_register import Tasks

session = Session()
db = Database()
tasks = Tasks()

def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)
    
    session.init_app(app)
   
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .main.models import TASK_ORDER
    tasks.add_task_order(TASK_ORDER)

    db.bind(**app.config['PONY'])
    db.generate_mapping(create_tables=True)
    Pony(app)


    return app



