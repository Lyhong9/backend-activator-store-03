'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        UserImage.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  UserImage.init({
    userId: DataTypes.INTEGER,
    imageUrl: DataTypes.TEXT,
    fileName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'UserImage',
  });
  return UserImage;
};