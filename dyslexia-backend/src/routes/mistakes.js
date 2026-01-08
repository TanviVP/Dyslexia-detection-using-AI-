import express from "express";
import { supabase } from "../supabase.js";
import { tagMistake } from "../tagger.js";

const router = express.Router();

// LOG MISTAKE + AUTO TAGGING
router.post("/log", async (req, res) => {
  const { attempt_id, question_no, expected_answer, user_answer, raw_data } =
    req.body;

  // Insert mistake
  const { data: mistake, error } = await supabase
    .from("mistakes")
    .insert([
      {
        attempt_id,
        question_no,
        expected_answer,
        user_answer,
        raw_data,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error });

  // Run rule-based tagger
  const tags = tagMistake(expected_answer, user_answer, raw_data);

  // Insert tags
  const tagRows = tags.map((t) => ({
    mistake_id: mistake.id,
    tag: t.tag,
    confidence: t.confidence,
    source: t.source,
  }));

  const { error: tagErr } = await supabase
    .from("mistake_tags")
    .insert(tagRows);

  if (tagErr) return res.status(500).json({ error: tagErr });

  res.json({ mistake, tags: tagRows });
});

export default router;
