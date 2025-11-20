from database import db

class Usuario(db.Model):
    __tablename__ = "usuarios"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    senha = db.Column(db.String(100))

class Hotel(db.Model):
    __tablename__ = "hoteis"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    cidade = db.Column(db.String(50))
    preco = db.Column(db.Float)
    avaliacao = db.Column(db.Float)

class Reserva(db.Model):
    __tablename__ = "reservas"
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    hotel_id = db.Column(db.Integer, db.ForeignKey("hoteis.id"))
