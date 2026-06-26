import React, { useState } from "react";
import siteModel from "../assets/siteModel.png"; 

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", age: "", weight: "", height: "", gender: "male",
  });

  const toggleMode = () => setIsLogin(!isLogin);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? "/api/login" : "/api/register";
    
    const url = `https://fitzi-backend1.onrender.com${endpoint}`; 

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        alert(data.error);
      }
    } catch (error) {
      // 🚨 UPDATED CATCH BLOCK: Logs the actual error to the browser console
      console.error("NETWORK/CORS ERROR DURING LOGIN:", error);
      alert(`Network Error: Check the browser console (Right Click -> Inspect -> Console) for the exact reason.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-section">
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "2.5rem" }}>
            {isLogin ? "Welcome Back" : "Join Fitzi"} <span style={{ color: "var(--accent-orange)" }}>✧</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" placeholder="First Last" required onChange={handleChange} />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="maxi@yahoo.com" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" required onChange={handleChange} />
          </div>

          {!isLogin && (
            <>
              <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Age</label>
                  <input type="number" name="age" placeholder="20" required onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Weight (kg)</label>
                  <input type="number" name="weight" placeholder="75" required onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Height (cm)</label>
                  <input type="number" name="height" placeholder="180" required onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label>Gender</label>
                <div style={{ display: "flex", gap: "1rem", color: "var(--text-main)" }}>
                  <label><input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} /> Male</label>
                  <label><input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} /> Female</label>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Connecting..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className="toggle-link">
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>

      <div className="auth-image-section">
        <img src={siteModel} alt="Model" className="bg-image" />
        <div className="orange-brand-box">
          <h3>fitzi</h3>
        </div>
      </div>
    </div>
  );
};

export default Login;