'use strict';
module.exports = (sequelize, DataTypes) => {

  const RequestLog = sequelize.define('request_log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    method: DataTypes.STRING,
    pathname: DataTypes.STRING,
    body: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
  });

  return RequestLog;
};
