import Gate from '../models/gate.model.js';

// GET /apiv1/gates - List all gates (optionally filter by lotId)
export async function listGates(req, res) {
  try {
    const { lotId } = req.query;
    const filter = lotId ? { lotId } : {};
    const gates = await Gate.find(filter).sort({ lotId: 1, type: 1 }).lean();
    return res.status(200).json(gates);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// GET /apiv1/gates/:gateId - Get single gate status
export async function getGate(req, res) {
  try {
    const { gateId } = req.params;
    const gate = await Gate.findOne({ gateId }).lean();
    if (!gate) {
      return res.status(404).json({ message: 'Gate not found' });
    }
    return res.status(200).json(gate);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// PATCH /apiv1/gates/:gateId/control - Send command to gate (open/close/stop)
export async function controlGate(req, res) {
  try {
    const { gateId } = req.params;
    const { command } = req.body;

    if (!['open', 'close', 'stop'].includes(command)) {
      return res.status(400).json({ message: 'Command must be: open, close, or stop' });
    }

    const gate = await Gate.findOne({ gateId });
    if (!gate) {
      return res.status(404).json({ message: 'Gate not found' });
    }

    // Simulate command - update status based on command
    let newStatus;
    let newPosition;
    if (command === 'open') {
      newStatus = 'opening';
      newPosition = 'moving';
    } else if (command === 'close') {
      newStatus = 'closing';
      newPosition = 'moving';
    } else {
      // stop - keep current position, set status to current position state
      newPosition = gate.position === 'up' ? 'up' : 'down';
      newStatus = newPosition === 'up' ? 'open' : 'closed';
    }

    const updated = await Gate.findOneAndUpdate(
      { gateId },
      {
        status: newStatus,
        position: newPosition,
        lastCommand: command,
        lastCommandAt: new Date(),
      },
      { new: true }
    ).lean();

    // Auto-complete motion after simulated delay
    if (command === 'open' || command === 'close') {
      setTimeout(async () => {
        const finalPosition = command === 'open' ? 'up' : 'down';
        const finalStatus = command === 'open' ? 'open' : 'closed';
        await Gate.findOneAndUpdate(
          { gateId },
          { status: finalStatus, position: finalPosition }
        );
        console.log(`Gate ${gateId} completed ${command}: ${finalStatus} (${finalPosition})`);
      }, 3000);
    }

    return res.status(200).json({
      gateId,
      command,
      previousStatus: gate.status,
      newStatus: updated.status,
      newPosition: updated.position,
    });
  } catch (error) {
    console.error('controlGate error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
