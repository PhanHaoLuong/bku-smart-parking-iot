import { validateBatch } from "../utils/eventvalidation.util.js"
import { ingestEvents, fetchLatestEvents } from "../utils/event.util.js"

export async function postIotEvents(req, res) {
  try {
    const { validItems, invalidItems } = validateBatch(req.body);

    if (validItems.length === 0) {
      return res.status(400).json({
        message: "No valid events",
        accepted: 0,
        rejected: invalidItems.length,
        errors: invalidItems,
      });
    }

    const ingestResult = await ingestEvents(validItems);

    return res.status(202).json({
      message: "Events processed",
      accepted: ingestResult.accepted,
      rejected: invalidItems.length,
      errors: invalidItems,
    });
  } catch (err) {
    console.error("postIotEvents error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getLatestEvents(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const events = await fetchLatestEvents(limit);
    return res.status(200).json(events);
  } catch (err) {
    console.error("getLatestEvents error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}