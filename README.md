
# 🔮 League of Legends - Match Outcome Predictor

Um sistema de predição de resultados de partidas 5v5 em **League of Legends**, usando **Machine Learning** com Flask + MongoDB + Tailwind no frontend.

---

## 📌 Funcionalidades

- 🎯 Predição de vitória com base na composição dos campeões por time.
- 📊 Dashboard com estatísticas históricas:
  - Taxa de vitória por lado (Blue / Red)
  - Campeões mais escolhidos
  - Campeões mais vitoriosos por lado
  - Campeões mais escolhidos por função (role)

---

## ⚙️ Tecnologias

### Backend
- Python 3.11
- Flask + Flask-CORS
- Pandas + NumPy
- Scikit-learn (Random Forest)
- MongoDB (Atlas)
- joblib / pickle (para salvar modelo)

### Frontend
- TailwindCSS
- Fetch API (REST)
- Dashboard customizado

---

## 🧠 Modelo de Machine Learning

Treinamento baseado em dados de partidas 5v5 com:

- Campeão
- Função (Role)
- Lado (Blue ou Red)
- Resultado (Vitória ou Derrota)

Utiliza um modelo **Gradient Boosting Classifier** para prever a probabilidade de vitória com base nesses dados.

---

## 🚀 Como rodar localmente

   ```bash
   git clone https://github.com/qnvitor/predlol.git
   cd nome-do-repositorio/backend
   ```

### 🐍 Backend

1. Vá para a pasta backend:
   ```bash
   cd predlol/backend
   ```

2. Crie um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # ou venv\Scripts\activate no Windows
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure seu `.env`:
   ```env
   MONGO_URI=mongodb+srv://<user>:<senha>@<cluster>.mongodb.net/LoLModel
   ```

5. Rode o servidor:
   ```bash
   python app.py
   ```

### 💻 Frontend

1. Vá até a pasta `frontend`:
   ```bash
   cd ../frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o .env
   ```bash
   localhost:(porta)
   ```

4. Rode o servidor:
   ```bash
   npm run dev
   ```

---

## 📡 Rotas da API

### `GET /options`
Retorna as opções disponíveis de campeões e roles para o frontend montar os dropdowns.

```json
{
  "roles": ["ADCARRY", "JUNGLE", "MID", "SUPPORT", "TOP"],
  "champions": ["Ahri", "Zed", "Garen", "Lee Sin", ...]
}
```

---

### `POST /predict`
Recebe os campeões escolhidos e retorna a predição.

**Exemplo de requisição:**

```json
{
  "blue": {
    "TOP": "Garen",
    "JUNGLE": "Lee Sin",
    "MID": "Ahri",
    "ADCARRY": "Jinx",
    "SUPPORT": "Leona"
  },
  "red": {
    "TOP": "Darius",
    "JUNGLE": "Kayn",
    "MID": "Zed",
    "ADCARRY": "Ezreal",
    "SUPPORT": "Thresh"
  }
}
```

**Resposta:**

```json
{
  "result": "Vitória RED",
  "probability_blue": 0.4421,
  "probability_red": 0.5579
}
```

---

### `GET /stats`
Retorna estatísticas gerais baseadas nas partidas preditas.

```json
{
  "blue_winrate": 51.3,
  "red_winrate": 48.7,
  "blue_champs": [["Ahri", 12], ["Jinx", 10]],
  "red_champs": [["Zed", 9], ["Thresh", 8]],
  "most_picked_champions": [["Ahri", 22], ["Lee Sin", 20]],
  "most_picked_by_role": {
    "TOP": [["Garen", 15]],
    "JUNGLE": [["Lee Sin", 18]],
    "MID": [["Ahri", 22]],
    "ADCARRY": [["Jinx", 20]],
    "SUPPORT": [["Leona", 19]]
  }
}
```

---

## 🤝 Como contribuir

1. Faça um fork do projeto
2. Crie uma branch com sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m 'Adiciona nova feature'
   ```
4. Push para o branch:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request

---

## 🧾 Licença

Este projeto está sob a licença MIT.

---
