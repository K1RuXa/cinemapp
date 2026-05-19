const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

// 1. Получить все фильмы
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Добавить новый фильм
router.post("/", async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// 3. Обновить данные фильма (PUT)
router.put("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (movie) {
      await movie.update(req.body);
      res.json(movie);
    } else {
      res.status(404).json({ message: "Фильм не найден" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Удалить фильм (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (movie) {
      await movie.destroy();
      res.json({ message: "Фильм удален" });
    } else {
      res.status(404).json({ message: "Фильм не найден" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;