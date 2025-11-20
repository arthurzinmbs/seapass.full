from flask import Blueprint, jsonify

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    return jsonify({"mensagem": "Backend SeaPass conectado com sucesso!"})

@main_bp.route("/api/passageiros", methods=["GET"])
def get_passageiros():
    passageiros = [
        {"id": 1, "nome": "Arthur Moraes"},
        {"id": 2, "nome": "Maria Silva"}
    ]
    return jsonify(passageiros)
