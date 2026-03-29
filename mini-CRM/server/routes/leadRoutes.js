import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead
} from "../controllers/leadController.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Lead routes
router
  .route("/")
  .post(createLead)
  .get(getLeads);

// Single lead routes
router
  .route("/:id")
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

export default router;