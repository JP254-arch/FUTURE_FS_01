import Lead from "../models/Lead.js";

// CREATE lead
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      source,
    });

    res.status(201).json({
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET single lead (FIX for your error)
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE lead
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};