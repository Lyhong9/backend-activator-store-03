'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoryImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CategoryImage.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });
    }
  }
  CategoryImage.init({
    categoryId: DataTypes.INTEGER,
    imageUrl: DataTypes.TEXT,
    fileName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CategoryImage',
  });
  return CategoryImage;
};