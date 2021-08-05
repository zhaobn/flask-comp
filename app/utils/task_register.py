from functools import wraps
import warnings

class TasksError(Exception):
    pass


class Tasks:
    tasks = {}
    task_order = []
    def add_task_order(self, task_order=None):
        
        if task_order:
            if hasattr(self, 'task_order'):
                self.task_order = self.task_order + list(task_order)
            else:
                self.task_order = list(task_order)
        

    def register(self, task_name, method=None):
        if task_name in self.tasks:
            raise TasksError(f'A function for task {task_name} has already been registered.')

        def wrapper(func):
            self.tasks[task_name] = {'function': func}
            self.tasks[task_name]['method'] = method
            @wraps(func)
            def inner(*args, **kwargs):
                return func(*args, **kwargs)
            return inner
        return wrapper


    def __call__(self, task_name, method=None):
        try:
            task = self.tasks[task_name]
        except KeyError:
            raise TasksError('No function was registered for task name "{}"'.format(task_name))
        if task['method'] and task['method'] != method:
            raise TasksError(f'HTTP method does not match the one declared. ' + \
                f'Required: {task["method"]}, received: {method}')

        return task['function']

    def __getitem__(self, task_name):
        try:
            return self.tasks[task_name]['function']
        except KeyError:
            raise TasksError('No function was registered for task name "{}"'.format(task_name))

    def __str__(self):
        return str(self.tasks)

    def as_list(self):
        return [key for key, _ in self.tasks.items()]