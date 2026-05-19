const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db"); // Твій конфіг Sequelize
const movieRoutes = require("./routes/movies");

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Маршрути для фільмів
app.use("/api/movies", movieRoutes);

// Маршрут для сеансів (виправлений)
app.get('/api/sessions', async (req, res) => {
  try {
    // Виконуємо запит через Sequelize
    const [data] = await sequelize.query("SELECT * FROM sessions");
    return res.json(data);
  } catch (err) {
    console.error("Помилка при отриманні сеансів:", err);
    return res.status(500).json({ message: "Помилка сервера", error: err });
  }
});

// Синхронізація та запуск
sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ База даних підключена та синхронізована!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущений на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Помилка підключення до бази:", err);
  });