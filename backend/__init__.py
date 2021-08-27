from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api

app = None
api = None
db = None

def create_app(config = "config.py"):
    global app, api, db
    
    # Setup Flask
    app = Flask(__name__)
    app.config.from_pyfile(config)
    db = SQLAlchemy(app)
    api = Api(app)

    # Load the database
    import backend.models
    db.create_all()

    # Load blueprints
    from backend.views import user, subject, note, label
    app.register_blueprint(user.bp, url_prefix='/user/')

    api.add_resource(subject.SubjectList, '/subjects/')
    api.add_resource(subject.SubjectResource, '/subject/<int:subject_id>/')
    api.add_resource(note.NoteList, '/subject/<int:subject_id>/notes/')
    api.add_resource(note.NoteResource, '/subject/<int:subject_id>/note/<int:note_id>/')
    api.add_resource(label.LabelList, '/labels/')
    api.add_resource(label.LabelResource, '/label/<int:label_id>/')

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Authenticate')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        return response

    return app