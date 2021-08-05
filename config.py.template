import os
from app.utils.random_order import Fixed, Random

app_dir = os.path.abspath(os.path.dirname(__file__))

test_var = 2

class BaseConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'A SECRET KEY' # SET A SECRET KEY FOR PRODUCTION
    SESSION_TYPE = 'filesystem'


class DevelopmentConfig(BaseConfig):
    
    DEBUG = True

    BASIC_AUTH_USERNAME = 'test'
    BASIC_AUTH_PASSWORD = 'test'

    PONY = {
        'provider': 'sqlite',
        'filename': os.path.join(app_dir, 'db_dev.db3'),
        'create_db': True
    }
   
    
class TestingConfig(BaseConfig):
    SERVER_NAME = 'testservername.none'
    DEBUG = True
    TESTING = True

    BASIC_AUTH_USERNAME = 'test'
    BASIC_AUTH_PASSWORD = 'test'

    PONY = {
        'provider': 'sqlite',
        'filename': ':memory:',
        'create_db': True
    }
 

class ProductionConfig(BaseConfig):
    BASIC_AUTH_USERNAME = 'test'
    BASIC_AUTH_PASSWORD = 'test'

    '''
    Change database settings to MySQL settings
    PONY = {
        'provider': 'mysql',  
        'host': 'chost4.is.ed.ac.uk',
        'user': 'wwwbramleylapppl_neil',
        'passwd': 'M2B(BKwEYa5.RXQ9',
        'db': 'wwwbramleylabppl_expdata'
    }
    '''
    PONY = {
        'provider': 'postgres', 
        'host': '127.0.0.1',
        'user': 'wwwbramleylabppl_flaskuser',
        'password': 'testpassword',
        'database': 'wwwbramleylabppl_flask'
    }