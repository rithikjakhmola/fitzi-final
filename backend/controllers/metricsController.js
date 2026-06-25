const User = require('../models/User');
const Metrics = require('../models/Metrics');

exports.calculateAndSetGoals = async (req, res) => {
  // Extract user ID from the verified JWT, completely ignoring frontend parameters for security
  const userId = req.user.id; 
  const { activityLevel, goal } = req.body;

  try {
    // Always fetch the freshest user data (in case they just updated their weight)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Calculate BMR (Mifflin-St Jeor Equation)
    let bmr = (10 * user.weight_kg) + (6.25 * user.height_cm) - (5 * user.age);
    bmr = user.gender.toLowerCase() === "male" ? bmr + 5 : bmr - 161;

    // 2. Calculate TDEE based on activity level
    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));

    // 3. Calculate Safe Target Calories based on Goal
    let targetCalories = tdee;
    if (goal === "cut") {
      targetCalories = tdee - 500; 
      if (targetCalories < 1200) targetCalories = 1200; // Hard safety limit
    } else if (goal === "gain") {
      targetCalories = tdee + 500; 
    }

    // 4. Upsert (Update or Insert) to the database
    await Metrics.upsert({ userId, activityLevel, goal, bmr, tdee, targetCalories });

    res.json({ message: "Goals calculated and saved!", metrics: { bmr, tdee, targetCalories, goal } });
  } catch (error) {
    res.status(500).json({ error: "Server error while calculating goals" });
  }
};

exports.getMetrics = async (req, res) => {
  const userId = req.user.id;
  try {
    const metrics = await Metrics.findByUserId(userId);
    if (!metrics) return res.status(404).json({ error: "No blueprint found. Please generate one." });
    
    // Convert keys from snake_case (DB) to camelCase (Frontend)
    res.json({ 
      metrics: {
        bmr: metrics.bmr,
        tdee: metrics.tdee,
        targetCalories: metrics.target_calories,
        goal: metrics.goal,
        activityLevel: metrics.activity_level
      } 
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};