import React, { useState, useEffect } from "react";

const DietPlan = ({ token, refreshTrigger }) => {
  const [plan, setPlan] = useState([]);
  const [dynamicMetrics, setDynamicMetrics] = useState({ target: 0, consumed: 0, remaining: 0 });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hungerStatus, setHungerStatus] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://fitzi-backend1.onrender.com/api/generate-plan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // SECURE JWT CALL
        },
        body: JSON.stringify({ hungerStatus }),
      });
      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
        setDynamicMetrics(data.metrics);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error fetching plan", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlan();
  }, [refreshTrigger, token]); // Refreshes if a meal is logged

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* Header & Metrics */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--text-main)" }}>Live Diet Plan</h2>
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "bold" }}>Appetite Status:</label>
            <select
              value={hungerStatus}
              onChange={(e) => setHungerStatus(e.target.value)}
              style={{ padding: "0.4rem", borderRadius: "8px", background: "var(--bg-panel)", color: "var(--text-main)", border: "1px solid var(--border-color)", outline: "none" }}
            >
              <option value="normal">Normal Portions</option>
              <option value="starving">Starving (High Volume/Low Cal)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", textAlign: "right" }}>
          <div style={{ background: "var(--bg-panel)", padding: "1rem 1.5rem", borderRadius: "12px", borderBottom: "4px solid var(--danger-red)" }}>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.80rem", fontWeight: "bold" }}>EATEN TODAY</p>
            <h3 style={{ margin: 0, color: "var(--danger-red)", fontSize: "1.8rem" }}>{dynamicMetrics.consumed} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>kcal</span></h3>
          </div>
          <div style={{ background: "var(--bg-panel)", padding: "1rem 1.5rem", borderRadius: "12px", borderBottom: "4px solid var(--success-green)" }}>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.80rem", fontWeight: "bold" }}>REMAINING</p>
            <h3 style={{ margin: 0, color: "var(--success-green)", fontSize: "1.8rem" }}>{dynamicMetrics.remaining} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>kcal</span></h3>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <h3>Recalculating your custom plan...</h3>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {plan.map((meal, index) => (
            <div
              key={index}
              onClick={() => setSelectedRecipe(meal)}
              style={{ background: "var(--bg-panel)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", border: "1px solid var(--border-color)", transition: "transform 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ position: "relative", height: "180px" }}>
                <img src={meal.image} alt={meal.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(17, 24, 39, 0.85)", color: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
                  {meal.type}
                </div>
              </div>

              <div style={{ padding: "1.2rem" }}>
                <h4 style={{ margin: "0 0 0.8rem 0", color: "var(--text-main)", height: "45px", overflow: "hidden" }}>{meal.name}</h4>
                <p style={{ margin: "0 0 1rem 0", color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600" }}>⚖️ {meal.portion}</p>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", fontWeight: "700" }}>
                  <span style={{ color: "var(--danger-red)" }}>🔥 {meal.calories} kcal</span>
                  <span style={{ color: "var(--blue-accent)" }}>🥩 {meal.protein}g P</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <button onClick={() => fetchPlan()} className="submit-btn" style={{ width: "auto", padding: "1rem 2.5rem" }}>
          Shuffle Remaining Meals
        </button>
      </div>

      {/* RECIPE MODAL (Dark Mode Update) */}
      {selectedRecipe && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setSelectedRecipe(null)}>
          <div style={{ background: "var(--bg-panel)", padding: "2.5rem", borderRadius: "20px", maxWidth: "600px", width: "90%", maxHeight: "85vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setSelectedRecipe(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "var(--bg-panel-light)", border: "none", color: "var(--text-main)", fontSize: "1.5rem", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}>&times;</button>
            
            <h3 style={{ marginTop: 0, fontSize: "1.6rem", color: "var(--text-main)" }}>{selectedRecipe.name}</h3>
            <img src={selectedRecipe.image} alt={selectedRecipe.name} style={{ width: "100%", height: "280px", objectFit: "cover", borderRadius: "12px", marginBottom: "1.5rem" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem", background: "var(--bg-dark)", borderRadius: "12px", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.8rem" }}>CALORIES</span><span style={{ color: "var(--danger-red)", fontWeight: "bold" }}>{selectedRecipe.calories}</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.8rem" }}>PROTEIN</span><span style={{ color: "var(--blue-accent)", fontWeight: "bold" }}>{selectedRecipe.protein}g</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.8rem" }}>CARBS</span><span style={{ color: "#dd6b20", fontWeight: "bold" }}>{selectedRecipe.carbs}g</span></div>
              <div style={{ textAlign: "center" }}><span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.8rem" }}>FATS</span><span style={{ color: "#805ad5", fontWeight: "bold" }}>{selectedRecipe.fats}g</span></div>
            </div>

            <h4 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem", color: "var(--text-main)" }}>Preparation Instructions</h4>
            <p style={{ whiteSpace: "pre-line", lineHeight: "1.8", color: "var(--text-muted)" }}>{selectedRecipe.recipe}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlan;