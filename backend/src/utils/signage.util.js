import SlotState from '../models/slotstate.model.js';

/**
 * Calculate signage status based on occupancy rate.
 * Reference: monitoring.util.js for slot counting patterns (lines 17-22)
 *
 * @param {number} occupancyRate - Percentage of occupied slots (0-100)
 * @returns {string} - 'available' | 'nearly_full' | 'full'
 */
function calculateStatus(occupancyRate) {
    if (occupancyRate >= 100) {
        return 'full';
    }
    if (occupancyRate >= 80) {
        return 'nearly_full';
    }
    return 'available';
}

/**
 * Build signage data for a single lot.
 * Pattern follows monitoring.util.js getMonitoringSummary() for slot counting.
 *
 * @param {string} lotId - The lot identifier (e.g., 'lot-1')
 * @returns {Object} - Signage status object for the lot
 */
async function buildSignageForLot(lotId) {
    // iotId format is 'iot-lot-1-L101', so query with regex to match all slots for a lot
    const lotFilter = { iotId: { $regex: `^iot-${lotId}` } };
    const totalSlots = await SlotState.countDocuments(lotFilter);
    const occupiedSlots = await SlotState.countDocuments({ ...lotFilter, status: 'occupied' });
    const freeSlots = Math.max(totalSlots - occupiedSlots, 0);
    const occupancyRate = totalSlots > 0
        ? Number(((occupiedSlots / totalSlots) * 100).toFixed(2))
        : 0;

    const lastSlot = await SlotState.findOne(lotFilter)
        .sort({ updatedAt: -1 })
        .lean();

    return {
        lotId,
        status: calculateStatus(occupancyRate),
        totalSlots,
        freeSlots,
        occupancyRate,
        lastUpdated: lastSlot?.updatedAt || null,
    };
}

/**
 * Get signage status for one lot or all lots.
 *
 * @param {string} [lotId] - Optional lot ID to get status for a specific lot
 * @returns {Object|Array} - Single lot object or array of all lots
 */
export async function getSignageStatus(lotId) {
    // Known lot IDs from seed data (lot-1, lot-3)
    const knownLots = ['lot-1', 'lot-3'];

    if (lotId) {
        // Return single lot status
        return buildSignageForLot(lotId);
    }

    // Return status for all known lots
    const results = await Promise.all(
        knownLots.map((lot) => buildSignageForLot(lot))
    );

    return results;
}