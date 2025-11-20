from flask import Blueprint, jsonify, current_app, request

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    return jsonify({"mensagem": "Backend SeaPass conectado com sucesso!"})

@main_bp.route("/api/passageiros", methods=["GET"])
def get_passageiros():
    conn = current_app.config["DB_CONN"]
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome FROM passageiro")
    passageiros = [{"id": row[0], "nome": row[1]} for row in cursor.fetchall()]
    cursor.close()
    return jsonify(passageiros)

@main_bp.route("/api/reservas", methods=["GET"])
def get_reservas():
    conn = current_app.config["DB_CONN"]
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.hotel, r.tipo_quarto, r.checkin, r.checkout,
               r.adultos, r.criancas, r.total, u.nome, u.email
        FROM reserva r
        JOIN usuario u ON r.usuario_id = u.id
    """)
    reservas = []
    for row in cursor.fetchall():
        reservas.append({
            "id": row[0],
            "hotel": row[1],
            "roomType": row[2],
            "checkin": row[3].isoformat(),
            "checkout": row[4].isoformat(),
            "guests": {"adults": row[5], "children": row[6]},
            "totalAmount": str(row[7]),
            "guestInfo": {"name": row[8], "email": row[9]}
        })
    cursor.close()
    return jsonify(reservas)

@main_bp.route("/api/reservas", methods=["POST"])
def create_reserva():
    conn = current_app.config["DB_CONN"]
    data = request.get_json(force=True)
    hotel = data.get("hotel")
    roomType = data.get("roomType")
    checkin = data.get("checkin")
    checkout = data.get("checkout")
    guests = data.get("guests", {})
    adultos = guests.get("adults", 0)
    criancas = guests.get("children", 0)
    total = data.get("totalAmount")
    usuario_id = data.get("usuario_id")

    if not hotel or not roomType or not checkin or not checkout or not usuario_id:
        return jsonify({"success": False, "erro": "Campos obrigatórios faltando"}), 400

    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reserva (hotel, tipo_quarto, checkin, checkout, adultos, criancas, total, usuario_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """, (hotel, roomType, checkin, checkout, adultos, criancas, total, usuario_id))
    reserva_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    return jsonify({"success": True, "reserva_id": reserva_id})
