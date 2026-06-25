const axios = require('axios');
const FormData = require('form-data');
const Metrics = require('../models/Metrics');
const Log = require('../models/Log');

exports.generatePlan = async (req, res) => {
  const userId = req.user.id; // Securely extracted from JWT
  const { hungerStatus = "normal" } = req.body;

  try {
    // 1. Fetch metrics & consumed calories
    const metrics = await Metrics.findByUserId(userId);
    if (!metrics) return res.status(400).json({ error: "Please set your goals first." });
    
    const consumedCalories = await Log.getConsumedToday(userId);
    let remainingCalories = Math.max(0, metrics.target_calories - consumedCalories);

    // 2. Chronological Logic
    const currentHour = new Date().getHours();
    let remainingMealsConfig = [];

    if (currentHour < 11) {
      remainingMealsConfig = [
        { name: "Lunch", tag: "main course", percent: 0.4 },
        { name: "Dinner", tag: "main course", percent: 0.4 },
        { name: "Snack", tag: "snack", percent: 0.2 },
      ];
    } else if (currentHour < 16) {
      remainingMealsConfig = [
        { name: "Dinner", tag: "main course", percent: 0.7 },
        { name: "Late Snack", tag: "snack", percent: 0.3 },
      ];
    } else {
      remainingMealsConfig = [{ name: "Final Meal", tag: "main course", percent: 1.0 }];
    }

    const dailyPlan = [];

    // 3. Fetch from Spoonacular
    for (const meal of remainingMealsConfig) {
      if (remainingCalories <= 100) break;
      const maxMealCalories = remainingCalories * meal.percent;

      let apiParams = {
        apiKey: process.env.SPOONACULAR_API_KEY,
        type: meal.tag,
        maxCalories: Math.round(maxMealCalories),
        minProtein: 10,
        number: 1,
        sort: "random",
        addRecipeInformation: true,
        addRecipeNutrition: true,
      };

      if (hungerStatus === "starving" && meal.tag !== "snack") {
        apiParams.type = "soup,salad";
        apiParams.maxFat = 12;
        apiParams.minFiber = 5;
      }

      const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, { params: apiParams });

      if (response.data.results && response.data.results.length > 0) {
        const recipe = response.data.results[0];
        const nutrients = recipe.nutrition.nutrients;
        const calories = nutrients.find((n) => n.name === "Calories")?.amount || 0;

        let instructions = "Combine ingredients as shown.";
        if (recipe.analyzedInstructions?.[0]?.steps?.length > 0) {
          instructions = recipe.analyzedInstructions[0].steps.map((s) => `${s.number}. ${s.step}`).join("\n\n");
        } else if (recipe.instructions) {
          instructions = recipe.instructions.replace(/<[^>]*>?/gm, "");
        }

        dailyPlan.push({
          id: recipe.id,
          type: meal.name,
          name: recipe.title,
          image: recipe.image,
          recipe: instructions,
          calories: Math.round(calories),
          protein: Math.round(nutrients.find((n) => n.name === "Protein")?.amount || 0),
          carbs: Math.round(nutrients.find((n) => n.name === "Carbohydrates")?.amount || 0),
          fats: Math.round(nutrients.find((n) => n.name === "Fat")?.amount || 0),
          portion: recipe.nutrition.weightPerServing ? `${Math.round(recipe.nutrition.weightPerServing.amount)}${recipe.nutrition.weightPerServing.unit}` : "1 Serving",
        });
      }
    }

    res.json({
      message: "Dynamic plan generated",
      plan: dailyPlan,
      metrics: { target: metrics.target_calories, consumed: consumedCalories, remaining: remainingCalories },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to dynamically generate the remaining diet plan." });
  }
};

exports.analyzeFood = async (req, res) => {
  const { imageBase64, weightGrams } = req.body;
  
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const form = new FormData();
    form.append("file", imageBuffer, { filename: "meal.jpg", contentType: "image/jpeg" });

    const response = await axios.post(
      `https://api.spoonacular.com/food/images/analyze?apiKey=${process.env.SPOONACULAR_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const data = response.data;
    const rawFoodName = data.category?.name || "Unknown Meal";
    const foodName = rawFoodName.charAt(0).toUpperCase() + rawFoodName.slice(1); 
    const multiplier = weightGrams / 100;

    res.json({
      foodName: foodName,
      calories: Math.round((data.nutrition?.calories?.value || 0) * multiplier),
      protein: Math.round((data.nutrition?.protein?.value || 0) * multiplier),
      carbs: Math.round((data.nutrition?.carbs?.value || 0) * multiplier),
      fats: Math.round((data.nutrition?.fat?.value || 0) * multiplier),
      weight: weightGrams,
    });
    
  } catch (error) {
    console.error("SPOONACULAR IS DOWN! Using fallback mock data...");
    
    // 🛠️ DEVELOPMENT FALLBACK: Returns fake data so you can keep testing your app!
    const multiplier = weightGrams / 100;
    
    // Sending back a fake "Grilled Chicken Breast"
    res.json({
      foodName: "Grilled Chicken Breast (AI Fallback)",
      calories: Math.round(165 * multiplier), 
      protein: Math.round(31 * multiplier),    
      carbs: Math.round(0 * multiplier),       
      fats: Math.round(3.6 * multiplier),      
      weight: weightGrams,
    });
  }
};

exports.logMeal = async (req, res) => {
  const userId = req.user.id;
  const { foodName, calories, protein, carbs, fats, weight } = req.body;
  try {
    await Log.create({ userId, foodName, calories, protein, carbs, fats, weight });
    res.json({ message: "Meal successfully committed to database logs!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log meal to SQL storage." });
  }
};

exports.getWeeklyProgress = async (req, res) => {
  const userId = req.user.id;
  try {
    const metrics = await Metrics.findByUserId(userId);
    const target = metrics ? metrics.target_calories : 2000;
    const logs = await Log.getWeeklyProgress(userId);

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; 
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); 
      
      const logForDay = logs.find(l => l.log_date === dateStr);
      chartData.push({
        day: dayName,
        calories: logForDay ? Number(logForDay.total_calories) : 0,
        target: target
      });
    }
    res.json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch progress data" });
  }
};