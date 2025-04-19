
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#4A90E2", "#FF5E5E"];
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => {
        setPieData([
          { name: "Blue Side", value: data.blue_winrate },
          { name: "Red Side", value: data.red_winrate }
        ]);

        const merged = [
        ...data.blue_champs.map(([name, wins]) => ({
          name,
          wins,
          side: "Blue"
        })),
        ...data.red_champs.map(([name, wins]) => ({
          name,
          wins,
          side: "Red"
        }))
      ];
        setBarData(merged);
      });
  }, []);

  return (
    <div className="p-6 space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Winrate por Lado</h2>
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            cx={200}
            cy={150}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Campeões com Mais Vitórias</h2>
        <BarChart width={500} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="wins" name="Blue Side" fill="#4A90E2" data={barData.filter(d => d.side === "Blue")} />
        </BarChart>
        <BarChart width={500} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="wins" name="Red Side" fill="#FF5E5E" data={barData.filter(d => d.side === "Red")} />
        </BarChart>
      </div>
    </div>
  );
}
