import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const ProgressChart = ({ token, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      // The backend extracts the user ID from the token automatically now
      const response = await fetch(`http://localhost:3000/api/weekly-progress`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const chartData = await response.json();
      if (response.ok) {
        setData(chartData);
      }
    } catch (error) {
      console.error("Error fetching chart data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, [refreshTrigger, token]); 

  // Dark Mode Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const cals = payload[0].value;
      const target = payload[0].payload.target;
      const isOver = cals > target;
      
      return (
        <div style={{ background: 'var(--bg-panel)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0, color: isOver ? 'var(--danger-red)' : 'var(--blue-accent)', fontWeight: 'bold' }}>
            {cals} kcal <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Target: {target})</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>📈 7-Day Adherence</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Track your consistency against your Fitzi blueprint.</p>

      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading analytics...</div>
      ) : (
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
              <YAxis hide={true} domain={[0, 'dataMax + 500']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-panel-light)' }} />
              
              {data.length > 0 && (
                <ReferenceLine y={data[0].target} stroke="var(--accent-orange)" strokeDasharray="3 3" label={{ position: 'top', value: 'TARGET', fill: 'var(--accent-orange)', fontSize: 12, fontWeight: 'bold' }} />
              )}
              
              <Bar dataKey="calories" radius={[6, 6, 6, 6]} barSize={40} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.calories > entry.target ? 'var(--danger-red)' : 'var(--blue-accent)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;