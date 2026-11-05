
import dotenv from "dotenv";
import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await testDatabaseConnection();

        app.listen(PORT, () => {
            console.log(`SmartBook server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error("Failed to start SmartBook server.");
        process.exit(1);
    }
};

startServer();

