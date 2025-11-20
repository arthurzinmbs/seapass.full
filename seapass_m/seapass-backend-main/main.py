from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)

try:
    conn = psycopg2.connect(
        dbname="seapass",
        user="postgres",
        password="sua_senha",
        host="127.0.0.1",
        port="5432"
    )
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    print("✅ Banco de dados conectado com sucesso!")
except Exception as e:
    print("❌ Erro ao conectar no banco de dados:", e)
    exit(1)

@app.route("/api/usuario", methods=["POST"])
def create_usuario():
    data = request.json
    try:
        cursor.execute(
            "INSERT INTO usuario (nome, email, telefone, senha) VALUES (%s, %s, %s, %s) RETURNING id",
            (data["nome"], data["email"], data.get("telefone", ""), data["senha"])
        )
        user_id = cursor.fetchone()["id"]
        conn.commit()
        return jsonify({"success": True, "id": user_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "erro": str(e)}), 400

@app.route("/api/reserva", methods=["POST"])
def create_reserva():
    data = request.json
    try:
        cursor.execute(
            "INSERT INTO reserva (nome_completo, email, telefone, cpf, destino, data_reserva, status) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (
                data["nome_completo"],
                data["email"],
                data["telefone"],
                data["cpf"],
                data.get("destino", ""),
                datetime.now(),
                "Pendente"
            )
        )
        reserva_id = cursor.fetchone()["id"]
        conn.commit()
        return jsonify({"success": True, "id": reserva_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "erro": str(e)}), 400

@app.route("/")
def home():
    return jsonify({"mensagem": "Backend SeaPass conectado!"})

if __name__ == "__main__":
    app.run(debug=True, port=4000)
