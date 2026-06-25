const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const { name, email, password, age, weight, height, gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ name, email, password: hashedPassword, age, weight, height, gender });
    
    // Generate token upon successful registration
    const token = generateToken({ id: userId, email });
    res.status(201).json({ message: "User created successfully!", token, user: { id: userId, name, email } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    // Generate token upon successful login
    const token = generateToken(user);
    res.json({ message: "Login successful!", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// NEW: Endpoint logic to update age/weight/height
exports.updateProfile = async (req, res) => {
  const userId = req.user.id; // Securely extracted from JWT
  const { age, weight, height } = req.body;
  
  try {
    await User.updateStats(userId, { age, weight, height });
    res.json({ message: "Stats updated! Recalculate your blueprint to see changes." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile stats" });
  }
};