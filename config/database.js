const { Sequelize } = require("sequelize");
const { config } = require("dotenv");
// const { Client } = require("ssh2");

config();

// const sshClient = new Client();

// Database connection configuration
const sequelize = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: "mysql",
	}
);

/* const tunnelConfig = {
	host: "ssh_server_host",
	port: 22,
	username: "ssh_user",
	privateKey: require("fs").readFileSync("/path/to/your/private/key"),
};
const forwardConfig = {
	srcHost: "127.0.0.1", // local end of the tunnel
	srcPort: 3307, // port to forward from
	dstHost: dbServer.host, // destination MySQL host
	dstPort: dbServer.port, // destination MySQL port
};
 */
// Test the database connection
async function testConnection() {
	try {
		await sequelize.authenticate();
		console.log("Database connection successful");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
}

testConnection(); // Test the connection when the file is loaded

module.exports = sequelize; // Export the configured Sequelize instance
