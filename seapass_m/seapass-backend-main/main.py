from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

# Conexão com o banco
try:
    conn = psycopg2.connect(
        host="localhost",
        database="seapass",
        user="postgres",
        password="acacio1"
    )
    print("Conexão com o banco realizada com sucesso!")
except Exception as e:
    print("Erro ao conectar ao banco:", e)

# Criação do Flask app
app = Flask(__name__)
CORS(app)  # Permite requisições de qualquer origem

# Teste de saúde da API
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "API funcionando!"})

# Cadastro de usuário
@app.route("/api/usuario", methods=["POST"])
def cadastro():
    try:
        data = request.get_json(force=True)

        nome = data.get("nome")
        email = data.get("email")
        telefone = data.get("telefone")
        senha = data.get("senha")

        # Verificação de campos obrigatórios
        if not nome or not email or not senha:
            return jsonify({
                "success": False,
                "erro": "Campos obrigatórios: nome, email, senha"
            }), 400

        cursor = conn.cursor()

        # Inserção na tabela **usuario**
        cursor.execute(
            "INSERT INTO usuario (nome, email, telefone, senha) VALUES (%s, %s, %s, %s)",
            (nome, email, telefone, senha)
        )

        conn.commit()
        cursor.close()

        return jsonify({"success": True, "message": "Cadastro realizado com sucesso!"})

    except Exception as e:
        print("Erro no cadastro:", str(e))
        return jsonify({"success": False, "erro": str(e)})

# Rodar o servidor
if __name__ == "__main__":
    app.run(debug=True, port=4000)
