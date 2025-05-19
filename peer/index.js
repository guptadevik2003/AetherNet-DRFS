import express from "express";
import config from "./config/appConfig.js";
// import heartbeatRoutes from "./routes/heartbeatRoutes.js";

// Express configs
const app = express();
app.use(express.json());

// API for Master
// app.use("/api/heartbeat", heartbeatRoutes);

// Initializing Functions

app.listen(config.node.port, () => {
  console.log(`[${config.node.id}] Running on port ${config.node.port}`);
});
