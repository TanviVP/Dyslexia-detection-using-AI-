import express from "express";
import { supabase } from "../supabase.js";
import { generateToken } from "../auth.js";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role: 'student'
    });

    res.json({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'student'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role: 'student'
    });

    res.json({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'student'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;