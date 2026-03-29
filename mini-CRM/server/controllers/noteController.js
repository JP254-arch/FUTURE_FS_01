import Note from "../models/Note.js";

// Add note to a lead
export const addNote = async (req, res) => {
  try {
    const note = await Note.create({
      lead: req.params.id,
      content: req.body.content
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notes for a lead
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ lead: req.params.id })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};