import os
import sys

from app import create_app

sys.path.insert(0, os.path.dirname(__file__))

application = create_app('config.TestingConfig')
