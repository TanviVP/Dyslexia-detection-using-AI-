import express from "express";
import cors from "cors";

import attemptRoutes from "./routes/attempts.js";
import mistakeRoutes from "./routes/mistakes.js";
import reportRoutes from "./routes/report.js";
import recommendationRoutes from "./routes/recommendations.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/attempts", attemptRoutes);
app.use("/mistakes", mistakeRoutes);
app.use("/report", reportRoutes);
app.use("/recommend", recommendationRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
