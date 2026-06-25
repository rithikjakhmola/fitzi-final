import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Check for existing session on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("fitzi_token");
    const savedUser = localStorage.getItem("fitzi_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("fitzi_token", jwtToken);
    localStorage.setItem("fitzi_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("fitzi_token");
    localStorage.removeItem("fitzi_user");
  };

  return (
    <>
      {user && token ? (
        <Dashboard user={user} token={token} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
};

export default App;