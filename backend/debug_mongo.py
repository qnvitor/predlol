import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("❌ Variável MONGO_URI não encontrada. Verifique seu arquivo .env.")
else:
    try:
        # Conectar ao MongoDB
        client = MongoClient(MONGO_URI)
        
        # Testar a conexão
        client.admin.command("ping")
        print("✅ Conectado ao MongoDB Atlas com sucesso.")

        # Acessar banco e coleções
        db = client['LoLModel']
        predictions_col = db['predictions']
        champions_col = db['champions']

        # Mostrar primeiros documentos de cada coleção (se houver)
        print("\n🔍 Verificando dados em 'predictions':")
        prediction = predictions_col.find_one()
        if prediction:
            print(prediction)
        else:
            print("📭 Nenhum dado encontrado em 'predictions'.")

        print("\n🔍 Verificando dados em 'champions':")
        champion = champions_col.find_one()
        if champion:
            print(champion)
        else:
            print("📭 Nenhum dado encontrado em 'champions'.")

    except ConnectionFailure as e:
        print("❌ Erro de conexão com o MongoDB:", e)
