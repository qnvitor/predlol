import unittest
import json
from app import app

class TestLolPredictionAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.headers = {"Content-Type": "application/json"}

    def make_payload(self, blue, red):
        return json.dumps({"blue": blue, "red": red})

    def test_CT01_predicao_valida(self):
        payload = self.make_payload(
            {"TOP": "Yone", "JUNGLE": "Maokai", "MID": "Corki", "ADCARRY": "Ziggs", "SUPPORT": "Bard"},
            {"TOP": "Jax", "JUNGLE": "Nocturne", "MID": "Tristana", "ADCARRY": "Sivir", "SUPPORT": "Alistar"}
        )
        response = self.client.post("/predict", headers=self.headers, data=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("result", response.json)

    def test_CT02_picks_incompletos(self):
        payload = self.make_payload(
            {"TOP": "Yone", "JUNGLE": "Maokai"},  # incompleto
            {"TOP": "Jax", "JUNGLE": "Nocturne", "MID": "Tristana", "ADCARRY": "Sivir", "SUPPORT": "Alistar"}
        )
        response = self.client.post("/predict", headers=self.headers, data=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)

    def test_CT03_role_incorreta(self):
        payload = self.make_payload(
            {"TOP": "Alistar", "JUNGLE": "Maokai", "MID": "Corki", "ADCARRY": "Ziggs", "SUPPORT": "Yone"},  # papéis trocados
            {"TOP": "Jax", "JUNGLE": "Nocturne", "MID": "Tristana", "ADCARRY": "Sivir", "SUPPORT": "Bard"}
        )
        response = self.client.post("/predict", headers=self.headers, data=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)

    def test_CT04_campeoes_repetidos(self):
        payload = self.make_payload(
            {"TOP": "Yone", "JUNGLE": "Maokai", "MID": "Corki", "ADCARRY": "Ziggs", "SUPPORT": "Bard"},
            {"TOP": "Yone", "JUNGLE": "Maokai", "MID": "Tristana", "ADCARRY": "Sivir", "SUPPORT": "Alistar"}  # campeões repetidos
        )
        response = self.client.post("/predict", headers=self.headers, data=payload)
        self.assertIn("error", response.json)

    def test_CT05_campeao_fora_do_modelo(self):
        payload = self.make_payload(
            {"TOP": "FakeChamp123", "JUNGLE": "Maokai", "MID": "Corki", "ADCARRY": "Ziggs", "SUPPORT": "Bard"},
            {"TOP": "Jax", "JUNGLE": "Nocturne", "MID": "Tristana", "ADCARRY": "Sivir", "SUPPORT": "Alistar"}
        )
        response = self.client.post("/predict", headers=self.headers, data=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
        self.assertIn("desconhecido", response.json["error"].lower())

    def test_CT06_dashboard_com_partidas_armazenadas(self):
        response = self.client.get("/stats")
        self.assertEqual(response.status_code, 200)
        self.assertIn("blue_winrate", response.json)
        self.assertIn("red_winrate", response.json)
        self.assertIn("blue_champs", response.json)
        self.assertIn("red_champs", response.json)

    def test_CT13_tempo_resposta(self):
        import time
        payload = self.make_payload(
            {"TOP": "Yone", "JUNGLE": "Maokai", "MID": "Corki", "ADCARRY": "Ziggs", "SUPPORT": "Bard"},
            {"TOP": "Jax", "JUNGLE": "Nocturne", "MID": "Tristana", "ADCARRY": "Sivir", "SUPPORT": "Alistar"}
        )
        start = time.time()
        response = self.client.post("/predict", headers=self.headers, data=payload)
        duration = time.time() - start
        self.assertLessEqual(duration, 2.0, f"Tempo de resposta excedido: {duration:.2f}s")
        self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main()
