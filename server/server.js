const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize"); // Додано для чистого зчитування масивів із бази
const sequelize = require("./config/db"); // Твій конфіг Sequelize
const movieRoutes = require("./routes/movies");

const app = express();
const JWT_SECRET = 'super_secret_key_cinema_123'; // Секретне слово для токенів сесії

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Маршрути для фільмів
app.use("/api/movies", movieRoutes);

// ==========================================
// МАРШРУТ ДЛЯ СЕАНСІВ
// ==========================================
app.get('/api/sessions', async (req, res) => {
  try {
    const data = await sequelize.query("SELECT * FROM sessions", {
      type: QueryTypes.SELECT
    });
    return res.json(data);
  } catch (err) {
    console.error("Помилка при отриманні сеансів:", err);
    return res.status(500).json({ message: "Помилка сервера", error: err });
  }
});

// ==========================================
// НОВИЙ МАРШРУТ: ОТРИМАННЯ КВИТКІВ КОРИСТУВАЧА
// ==========================================
app.get('/api/user/tickets/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Зв'язуємо таблиці, щоб отримати повну інформацію про квиток та фільм
    const tickets = await sequelize.query(`
      SELECT 
        t.id AS ticket_id,
        t.seat_details,
        s.show_time,
        m.title,
        m.image,
        m.genre
      FROM tickets t
      JOIN sessions s ON t.session_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN orders o ON t.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY s.show_time DESC
    `, {
      replacements: [userId],
      type: QueryTypes.SELECT
    });

    return res.json(tickets);
  } catch (err) {
    console.error("Помилка при отриманні квитків користувача:", err);
    return res.status(500).json({ error: "Помилка сервера при завантаженні квитків" });
  }
});

// ==========================================
// МАРШРУТИ ДЛЯ АВТОРИЗАЦІЇ
// ==========================================

// 1. РЕЄСТРАЦІЯ
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Будь ласка, заповніть усі поля!" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    await sequelize.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      { replacements: [username, email, password_hash] }
    );

    const insertedUser = await sequelize.query(
      "SELECT id FROM users WHERE email = ?",
      { 
        replacements: [email],
        type: QueryTypes.SELECT
      }
    );
    
    const userId = insertedUser[0].id;

    const token = jwt.sign(
      { id: userId, username, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: "Користувача успішно створено!",
      token,
      user: { id: userId, username, email }
    });

  } catch (err) {
    console.error("Помилка при реєстрації на сервері:", err);
    
    if (err.parent && err.parent.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Користувач з таким Email вже існує!" });
    }
    
    return res.status(500).json({ error: "Помилка сервера при реєстрації" });
  }
});

// 2. ВХІД (АВТОРИЗАЦІЯ)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Заповніть email та пароль!" });
  }

  try {
    const rows = await sequelize.query(
      "SELECT * FROM users WHERE email = ?",
      { 
        replacements: [email],
        type: QueryTypes.SELECT
      }
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Неправильний Email або пароль!" });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Неправильний Email або пароль!" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: "Вхід успішний!",
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error("Помилка при вході на сервер:", err);
    return res.status(500).json({ error: "Помилка сервера при вході" });
  }
});

// ==========================================
// СИНХРОНІЗАЦІЯ ТА ЗАПУСК СЕРВЕРА
// ==========================================
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