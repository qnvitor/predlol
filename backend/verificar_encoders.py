import joblib

encoders = joblib.load("encoders_rf_solo.pkl")
for i, enc in enumerate(encoders):
    print(f"Encoder {i}: {type(enc)}")
