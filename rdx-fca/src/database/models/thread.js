const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Thread = sequelize.define("Thread", {
    threadID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    participants: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    participantIDs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adminIDs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    threadType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    muteUntil: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    messageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastActivity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return Thread;
};
module.exports.credits = "SARDAR RDX";
