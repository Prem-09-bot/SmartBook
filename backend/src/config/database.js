
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const testDatabaseConnection = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL Database Connected Successfully!");

        const [rows] = await connection.query(
            "SELECT DATABASE() AS databaseName, VERSION() AS version"
        );

        console.log("Database:", rows[0].databaseName);
        console.log("MySQL Version:", rows[0].version);

        connection.release();

        return true;
    } catch (error) {
        console.error("MySQL Connection Failed:", error.message);
        throw error;
    }
};

export default pool;
