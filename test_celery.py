from celery import Celery

# Create a simple Celery app
app = Celery('test_app', broker='redis://localhost:6379/0')

@app.task
def add(x, y):
    return x + y

if __name__ == '__main__':
    # Start the worker
    app.worker_main(['worker', '--loglevel=info'])
