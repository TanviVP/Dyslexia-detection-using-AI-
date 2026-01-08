// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import scoresRouter from "./routes/scores.js";
import recommendationsRouter from "./routes/recommendations.js";
import assessmentRouter from "./routes/assessment.js";
import adaptiveRouter from "./routes/adaptive.js";
import profilesRouter from "./routes/profiles.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/scores", scoresRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/assessment", assessmentRouter);
app.use("/api/adaptive", adaptiveRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/auth", authRouter);

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // MUST be service role!!!
);

// -------------------------------
// 1. Create new attempt
// -------------------------------
app.post("/attempts", async (req, res) => {
  const { user_id, game_id, score, total_questions } = req.body;

  const { data, error } = await supabase
    .from("attempts")
    .insert([{ user_id, game_id, score, total_questions }])
    .select("*")
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// -------------------------------
// 2. Add a mistake in an attempt
// -------------------------------
app.post("/mistakes", async (req, res) => {
  const {
    attempt_id,
    question_no,
    expected_answer,
    user_answer,
    mistake_text_description,
    raw_data,
  } = req.body;

  const { data, error } = await supabase
    .from("mistakes")
    .insert([
      {
        attempt_id,
        question_no,
        expected_answer,
        user_answer,
        mistake_text_description,
        raw_data,
      },
    ])
    .select("*")
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// -------------------------------
// 3. Add ML/Rule-Based Tag
// -------------------------------
app.post("/mistake-tags", async (req, res) => {
  const { mistake_id, tag_type, confidence, source, model_version } = req.body;

  const { data, error } = await supabase
    .from("mistake_tags")
    .insert([
      {
        mistake_id,
        tag_type,
        confidence,
        source,
        model_version,
      },
    ])
    .select("*")
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// -------------------------------
// 4. Get full analysis for one attempt
// -------------------------------
app.get("/attempt/:id/full", async (req, res) => {
  const attempt_id = req.params.id;

  const { data: mistakes, error } = await supabase
    .from("mistakes")
    .select("*, mistake_tags(*)")
    .eq("attempt_id", attempt_id);

  if (error) return res.status(400).json({ error });

  res.json(mistakes);
});

// -------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Dyslexia Assessment Backend is running",
    features: [
      "Neurological difficulty tagging",
      "Adaptive scoring engine", 
      "Risk assessment",
      "Pattern recognition"
    ]
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
