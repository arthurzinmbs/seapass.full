from app.config.db_config import get_db_connection

conn = get_db_connection()
if conn:
    print("✅ Conexão com o banco de dados bem-sucedida!")
    conn.close()
else:
    print("❌ Falha na conexão com o banco de dados.")
