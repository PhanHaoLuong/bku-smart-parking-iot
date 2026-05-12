import * as signageUtil from '../utils/signage.util.js';

/**
 * Get signage status for one lot or all lots.
 * GET /apiv1/signage/status or GET /apiv1/signage/status/:lotId
 */
export async function getSignageStatus(req, res) {
    try {
        const { lotId } = req.params;
        const result = await signageUtil.getSignageStatus(lotId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error getting signage status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve signage status',
        });
    }
}