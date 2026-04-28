const ALLOWED_TYPES = new Set([
  "vehicle_entry",
  "vehicle_exit",
  "slot_occupied",
  "slot_freed",
  "plate_detected",
  "heartbeat",
]);

function validateEvent(raw) {
  const errors = [];
  const evt = {
    eventId: String(raw.eventId || "").trim(),
    eventType: String(raw.eventType || "").trim(),
    deviceId: String(raw.deviceId || "").trim(),
    lotId: String(raw.lotId || "").trim(),
    slotId: raw.slotId ? String(raw.slotId).trim() : null,
    plateNumber: raw.plateNumber ? String(raw.plateNumber).trim().toUpperCase() : null,
    timestamp: raw.timestamp ? new Date(raw.timestamp) : null,
  };

  if (!evt.eventId) errors.push("eventId is required");
  if (!ALLOWED_TYPES.has(evt.eventType)) errors.push("eventType is invalid");
  if (!evt.deviceId) errors.push("deviceId is required");
  if (!evt.lotId) errors.push("lotId is required");
  if (!(evt.timestamp instanceof Date) || Number.isNaN(evt.timestamp.getTime())) {
    errors.push("timestamp is invalid");
  }

  if ((evt.eventType === "slot_occupied" || evt.eventType === "slot_freed") && !evt.slotId) {
    errors.push("slotId is required for slot events");
  }

  if ((evt.eventType === "vehicle_entry" || evt.eventType === "vehicle_exit") && !evt.plateNumber) {
    errors.push("plateNumber is required for vehicle entry/exit");
  }

  return { valid: errors.length === 0, evt, errors };
}

export function validateBatch(payload) {
  const items = Array.isArray(payload) ? payload : [payload];
  const validItems = [];
  const invalidItems = [];

  items.forEach((raw, index) => {
    const r = validateEvent(raw);
    if (r.valid) validItems.push(r.evt);
    else invalidItems.push({ index, errors: r.errors, raw });
  });

  return { validItems, invalidItems };
}
