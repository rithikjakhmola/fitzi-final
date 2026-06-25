import React, { useState, useEffect } from "react";
import DietPlan from "./DietPlan";
import FoodLogger from "./FoodLogger";
import ProgressChart from "./ProgressChart";

const Dashboard = ({ user, token, onLogout }) => {
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("maintain");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("blueprint");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Edit Stats Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStats, setEditStats] = useState({ age: "", weight: "", height: "" });

  // 1. Fetch existing metrics on load
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("https://fitzi-backend1.onrender.com/api/get-metrics", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setMetrics(data.metrics);
          setActivityLevel(data.metrics.activityLevel);
          setGoal(data.metrics.goal);
        }
      } catch (error) {
        console.error("Failed to fetch metrics");
      }
    };
    fetchMetrics();
  }, [token]);

  // 2. Calculate & Save Blueprint
  const calculateGoals = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/set-goals", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ activityLevel, goal }),
      });
      const data = await response.json();
      if (response.ok) {
        setMetrics(data.metrics);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Update User Biometrics (Age, Weight, Height)
  const handleUpdateStats = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/update-profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(editStats),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setShowEditModal(false);
        // Force a recalculation with the new stats
        document.getElementById("calc-btn").click(); 
      }
    } catch (error) {
      alert("Failed to update stats.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: "var(--bg-dark)", overflow: "hidden" }}>
      
      {/* LEFT COLUMN - Settings & Analytics */}
      <div style={{ flex: metrics ? "0 0 50%" : "1", height: "100%", overflowY: "auto", padding: "2rem", borderRight: "1px solid var(--border-color)", transition: "flex 0.4s ease" }}>
        
        {/* Toggle Switch */}
        {metrics && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", background: "var(--bg-panel)", padding: "0.4rem", borderRadius: "12px", width: "100%", maxWidth: "400px" }}>
              <button 
                onClick={() => setActiveTab("blueprint")}
                style={{ flex: 1, padding: "0.8rem", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", background: activeTab === "blueprint" ? "var(--bg-panel-light)" : "transparent", color: activeTab === "blueprint" ? "var(--text-main)" : "var(--text-muted)" }}
              >⚙️ Blueprint</button>
              <button 
                onClick={() => setActiveTab("progress")}
                style={{ flex: 1, padding: "0.8rem", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", background: activeTab === "progress" ? "var(--bg-panel-light)" : "transparent", color: activeTab === "progress" ? "var(--text-main)" : "var(--text-muted)" }}
              >📈 Progress</button>
            </div>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === "blueprint" && (
          <div style={{ animation: "fadeIn 0.4s ease", maxWidth: "800px", margin: "0 auto" }}>
            
            {/* Header Area */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", padding: "2rem", background: "var(--bg-panel)", borderRadius: "20px" }}>
              <div>
                <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>Welcome, {user.name} 👋</h1>
                <button onClick={() => setShowEditModal(true)} style={{ background: "transparent", border: "1px solid var(--accent-orange)", color: "var(--accent-orange)", padding: "0.4rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                  Edit My Stats
                </button>
              </div>
              <button onClick={onLogout} style={{ background: "var(--bg-panel-light)", color: "var(--text-main)", border: "none", padding: "0.8rem 1.5rem", borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>
                Logout
              </button>
            </div>

            {/* Goal Engine Form */}
            <form onSubmit={calculateGoals} style={{ background: "var(--bg-panel)", padding: "2rem", borderRadius: "20px", marginBottom: "2rem" }}>
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>⚡ Set Your Engine</h2>
              
              <div className="input-group">
                <label>Activity Level</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="light">Lightly Active (1-3 workouts/week)</option>
                  <option value="moderate">Moderately Active (3-5 workouts/week)</option>
                  <option value="active">Highly Active (6-7 intense workouts/week)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Primary Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="cut">🔥 Cut Fat</option>
                  <option value="maintain">⚖️ Maintain</option>
                  <option value="gain">💪 Build Muscle</option>
                </select>
              </div>

              <button id="calc-btn" type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Calculating..." : "Calculate My Blueprint"}
              </button>
            </form>

            {/* Metrics Display */}
            {metrics && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                <div style={{ background: "rgba(255, 107, 53, 0.1)", border: "1px solid var(--accent-orange)", padding: "1.5rem", borderRadius: "16px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "var(--accent-orange)", fontWeight: "bold", fontSize: "0.85rem" }}>DAILY CALORIES</p>
                  <h2 style={{ margin: 0, fontSize: "2.2rem", color: "var(--text-main)" }}>{metrics.targetCalories}</h2>
                </div>
                <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border-color)", padding: "1.5rem", borderRadius: "16px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.85rem" }}>MAINTENANCE (TDEE)</p>
                  <h2 style={{ margin: 0, fontSize: "2.2rem" }}>{metrics.tdee}</h2>
                </div>
              </div>
            )}

            {/* Food Logger */}
            {metrics && (
              <div style={{ marginTop: "2rem" }}>
                <FoodLogger token={token} onMealLogged={() => setRefreshTrigger(prev => prev + 1)} />
              </div>
            )}
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
           <div style={{ animation: "fadeIn 0.4s ease" }}>
             <ProgressChart token={token} refreshTrigger={refreshTrigger} />
           </div>
        )}
      </div>

      {/* RIGHT COLUMN - Diet Plan */}
      {metrics && (
        <div style={{ flex: "1", height: "100%", overflowY: "auto", background: "var(--bg-dark)" }}>
          <DietPlan token={token} refreshTrigger={refreshTrigger} />
        </div>
      )}

      {/* EDIT STATS MODAL */}
      {showEditModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "var(--bg-panel)", padding: "2.5rem", borderRadius: "20px", width: "100%", maxWidth: "400px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Update Biometrics</h2>
            <form onSubmit={handleUpdateStats}>
              <div className="input-group">
                <label>Age</label>
                <input type="number" value={editStats.age} onChange={(e) => setEditStats({...editStats, age: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Weight (kg)</label>
                <input type="number" value={editStats.weight} onChange={(e) => setEditStats({...editStats, weight: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Height (cm)</label>
                <input type="number" value={editStats.height} onChange={(e) => setEditStats({...editStats, height: e.target.value})} required />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: "1rem", borderRadius: "12px", background: "var(--bg-panel-light)", color: "white", border: "none", cursor: "pointer" }}>Cancel</button>
                <button type="submit" className="submit-btn" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default Dashboard;