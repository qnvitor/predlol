from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import pandas as pd
import joblib
import pickle
from datetime import datetime, timezone
from collections import Counter

# Carregar variáveis do .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Conectar ao MongoDB Atlas
client = MongoClient(MONGO_URI)
db = client['LoLModel']
predictions_col = db['predictions']
champions_col = db['champions']

# Carregar modelo e encoders
model = joblib.load('modelo_rf_solo.pkl')
encoders = joblib.load('encoders_rf_solo.pkl')

# Setup Flask
app = Flask(__name__)
CORS(app)

roles = ['ADCARRY', 'JUNGLE', 'MID', 'SUPPORT', 'TOP']

@app.route("/options", methods=["GET"])
def get_options():
    champions = sorted(champions_col.distinct("name"))
    return jsonify({"roles": roles, "champions": champions})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        blue = data.get('blue', {})
        red = data.get('red', {})

        if len(blue) != 5 or len(red) != 5:
            return jsonify({"error": "Preencha todos os 5 picks de cada lado."}), 400

        def process_team(team, side):
            row = []
            for role in roles:
                champ = team.get(role)
                if not champ:
                    raise ValueError(f"Campeão faltando para {role}")
                row.extend([champ, role])
            row.append(side)
            return row

        row_blue = process_team(blue, 0)
        row_red = process_team(red, 1)

        def encode_row(row):
            df = pd.DataFrame([row])
            print("Row recebida para encode:", row)
            for i in range(len(row)):
                print(f"Coluna {i} | Valor: {row[i]} | Encoder: {type(encoders[i])}")
                if row[i] not in encoders[i].classes_:
                    return None, f"Valor desconhecido: {row[i]}"
                df.iloc[:, i] = encoders[i].transform([row[i]])
            return df, None


        X_blue, err_blue = encode_row(row_blue)
        X_red, err_red = encode_row(row_red)

        if err_blue or err_red:
            return jsonify({"error": err_blue or err_red}), 400

        proba_blue = model.predict_proba(X_blue)[0][1]
        proba_red = model.predict_proba(X_red)[0][1]

        if proba_blue >= proba_red:
            result = "Vitória BLUE"
        else:
            result = "Vitória RED"

        predictions_col.insert_one({
            "timestamp": datetime.now(timezone.utc),
            "champions_blue": blue,
            "champions_red": red,
            "probability_blue": proba_blue,
            "probability_red": proba_red,
            "result": result
        })

        return jsonify({
            "result": result,
            "probability_blue": round(proba_blue, 4),
            "probability_red": round(proba_red, 4)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats", methods=["GET"])
def stats():
    docs = list(predictions_col.find())
    total = len(docs)
    blue_wins = sum(1 for d in docs if d['result'] == "Vitória BLUE")
    red_wins = total - blue_wins

    def top_champs(data, side):
        champs = [
            champ
            for d in data if d['result'] == f"Vitória {side.upper()}"
            for champ in d[f'champions_{side.lower()}'].values()
        ]
        return Counter(champs).most_common(5)

    # 🔹 Campeões mais usados no total
    all_champions = []
    for d in docs:
        all_champions.extend(d['champions_blue'].values())
        all_champions.extend(d['champions_red'].values())
    most_picked = Counter(all_champions).most_common(10)

    # 🔸 Campeões mais usados por função
    roles = ['TOP', 'JUNGLE', 'MID', 'ADCARRY', 'SUPPORT']
    role_champion_counts = {role: Counter() for role in roles}

    for d in docs:
        for side in ['blue', 'red']:
            team = d[f'champions_{side}']
            for role, champ in team.items():
                role_champion_counts[role][champ] += 1

    most_picked_by_role = {
        role: role_champion_counts[role].most_common(5)
        for role in roles
    }

    return jsonify({
        "blue_winrate": round(blue_wins / total * 100, 1) if total else 0,
        "red_winrate": round(red_wins / total * 100, 1) if total else 0,
        "blue_champs": top_champs(docs, 'blue'),
        "red_champs": top_champs(docs, 'red'),
        "most_picked_champions": most_picked,
        "most_picked_by_role": most_picked_by_role  # 🚀 novo campo!
    })


if __name__ == "__main__":
    app.run(debug=True)
