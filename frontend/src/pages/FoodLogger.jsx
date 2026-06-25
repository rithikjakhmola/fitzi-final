import React, { useState } from "react";

const FoodLogger = ({ token, onMealLogged }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result); 
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!imagePreview || !weight) return alert("Please specify a photo and the container gram weight.");
    setLoading(true);
    
    try {
      const response = await fetch('https://fitzi-backend1.onrender.com/api/analyze-food', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ imageBase64: imagePreview, weightGrams: Number(weight) })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAnalyzedData(data);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error trying to interface with vision endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async () => {
    try {
      const response = await fetch('https://fitzi-backend1.onrender.com/api/log-meal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(analyzedData)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setImagePreview(null);
        setWeight('');
        setAnalyzedData(null);
        if (onMealLogged) onMealLogged(); 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error logging meal metrics.");
    }
  };

  return (
    <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ margin: "0 0 1.5rem 0", color: 'var(--text-main)', fontSize: '1.4rem' }}>📸 Snap & Log Off-Plan Meal</h2>
      
      {!analyzedData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Upload Food Photo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 0 }} />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginTop: '1rem' }} />}
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Food Weight (grams)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 250" style={{ marginBottom: 0 }} />
          </div>

          <button onClick={analyzeFood} disabled={loading} className="submit-btn" style={{ marginTop: '0.5rem' }}>
            {loading ? "AI Analysis in progress..." : "Identify & Analyze"}
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: "0 0 0.5rem 0", color: 'var(--text-main)' }}>AI Detected: {analyzedData.foodName}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Calculated details for {analyzedData.weight}g:</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', marginBottom: '2rem', fontSize: '1.2rem' }}>
            <span style={{ color: 'var(--danger-red)' }}>🔥 {analyzedData.calories} kcal</span>
            <span style={{ color: 'var(--blue-accent)' }}>🥩 {analyzedData.protein}g P</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setAnalyzedData(null)} style={{ flex: 1, padding: '1rem', background: 'var(--bg-panel-light)', color: 'var(--text-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Re-take</button>
            <button onClick={logMeal} style={{ flex: 2, padding: '1rem', background: 'var(--accent-orange)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm & Log</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLogger;