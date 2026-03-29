import express from "express";
import { addNote, getNotes } from "../controllers/noteController.js";

const router = express.Router();

router.post("/:id/notes", addNote);
router.get("/:id/notes", getNotes);

export default router;