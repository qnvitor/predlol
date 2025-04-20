import React, { useState, useEffect } from "react";

const RoleSelector = ({ side, role, champions, onChange, selectedChamps, selectedChampion }) => {
  const availableChamps = champions.filter(c => !selectedChamps.includes(c) || c === selectedChampion);
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">{role} - {side}</label>
      <select
        className="w-full border rounded p-2"
        value={selectedChampion || ""}
        onChange={(e) => onChange(role, e.target.value)}
      >
        <option value="">Escolha um campeão</option>
        {availableChamps.map((champ) => (
          <option key={champ} value={champ}>{champ}</option>
        ))}
      </select>
    </div>
  );
};

export default function LolPredictionForm() {
  const [roles, setRoles] = useState([]);
  const [championsByRole, setChampionsByRole] = useState({});
  const [blueTeam, setBlueTeam] = useState({});
  const [redTeam, setRedTeam] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const roleMap = {
    "Top": "TOP",
    "Jungle": "JUNGLE",
    "Mid": "MID",
    "ADCarry": "ADCARRY",
    "Support": "SUPPORT"
  };

  const modelRoleOrder = ["ADCARRY", "JUNGLE", "MID", "SUPPORT", "TOP"];

  useEffect(() => {
    setRoles(["Top", "Jungle", "Mid", "ADCarry", "Support"]);
    fetch(`${API_URL}/options`)
      .then(res => res.json())
      .then(data => {
        setChampionsByRole(data.champions_by_role || {});
      });
  }, []);

  const handleChange = (role, champ, side) => {
    const modelRole = roleMap[role];
    if (!modelRole) return;

    if (side === "Blue") {
      setBlueTeam((prev) => ({
        ...prev,
        [modelRole]: champ
      }));
    } else {
      setRedTeam((prev) => ({
        ...prev,
        [modelRole]: champ
      }));
    }
  };

  const handlePredict = async () => {
    if (modelRoleOrder.some((r) => !blueTeam[r] || !redTeam[r])) {
      alert("Preencha todos os picks dos dois times.");
      return;
    }

    const orderedBlueTeam = {};
    const orderedRedTeam = {};
    modelRoleOrder.forEach((role) => {
      orderedBlueTeam[role] = blueTeam[role];
      orderedRedTeam[role] = redTeam[role];
    });

    const payload = { blue: orderedBlueTeam, red: orderedRedTeam };
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setPrediction(`${data.result} (Blue: ${Math.round(data.probability_blue * 100)}%, Red: ${Math.round(data.probability_red * 100)}%)`);
      } else {
        setPrediction(`Erro do servidor: ${data.error}`);
      }
    } catch (error) {
      setPrediction("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const selectedChamps = [...Object.values(blueTeam), ...Object.values(redTeam)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Time Azul</h2>
        {roles.map((uiRole) => (
          <RoleSelector
          key={`blue-${uiRole}`}
          side="Blue"
          role={uiRole}
          champions={championsByRole[roleMap[uiRole]] || []}
          onChange={(r, c) => handleChange(r, c, "Blue")}
          selectedChampion={blueTeam[roleMap[uiRole]]}
          selectedChamps={selectedChamps}
        />
        ))}
      </div>

      <div className="flex justify-center items-center">
        <button
          onClick={handlePredict}
          className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Calculando..." : "Prever"}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Time Vermelho</h2>
        {roles.map((uiRole) => (
          <RoleSelector
            key={`red-${uiRole}`}
            side="Red"
            role={uiRole}
            champions={championsByRole[roleMap[uiRole]] || []}
            onChange={(r, c) => handleChange(r, c, "Red")}
            selectedChampion={redTeam[roleMap[uiRole]]}
            selectedChamps={selectedChamps}
          />
        ))}
      </div>

      {prediction && (
        <div className="col-span-3 text-center mt-6">
          <p className="text-xl font-bold text-green-600">Resultado da predição: {prediction}</p>
        </div>
      )}
    </div>
  );
}
