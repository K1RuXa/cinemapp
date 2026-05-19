const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const Movie = sequelize.define("Movie", {
  title: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  description: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING,
  },
  genre: {
    type: DataTypes.STRING,
  },
  rating: {
    type: DataTypes.FLOAT,
  },
  year: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Movie;