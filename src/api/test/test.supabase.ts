import { Router, type Request, type Response } from "express";
import { supabase } from "../../packages/db/db.supabase";

const supabaseTestRoutes = Router();

// 🔍 Connectivity check
supabaseTestRoutes.get("/supabase-test", async (_: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("test").select("*").limit(1);

    if (error) {
      console.error("Supabase GET error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supabase connected successfully",
      sample: data,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
    });
  }
});

// ➕ Insert test user
supabaseTestRoutes.post("/supabase-test", async (req: Request, res: Response) => {
  const { email, username } = req.body;

  if (typeof email !== "string" || typeof username !== "string") {
    return res.status(400).json({
      success: false,
      message: "Both email and username must be strings",
    });
  }

  try {
    const { data, error } = await supabase.from("test").insert([{ email, username }]).select(); // Ensures inserted data is returned

    if (error) {
      console.error("Supabase POST error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Insert failed",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User inserted successfully",
      data,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
    });
  }
});

export default supabaseTestRoutes;
