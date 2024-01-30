const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Your Sequelize instance

const User = sequelize.define(
	"user",
	{
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
			unique: true,
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		encodedPassword: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		failedAttempts: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		isLocked: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		userRoleId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		createdBy: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		modifiedAt: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		modifiedBy: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "user",
		timestamps: false,
	}
);

module.exports = User;
