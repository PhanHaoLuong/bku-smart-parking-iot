# Parking Sessions Filter Design

## Overview
Add client-side filtering to the operator's parking sessions view.

## UI Changes

**ParkingHistoryPage.jsx (operator role only):**
- Title: "All Sessions" (instead of "Parking History")
- Subtitle: "View and filter all parking sessions"

**Filter Bar:**
- Plate number input: text field with placeholder "Search plate number..."
- From date: date input
- To date: date input
- Clear filters button

## Filter Logic

- **Plate number**: case-insensitive partial match on plateNumber field
- **Date range**: filter by entryTime field (inclusive start, inclusive end)
- Filters apply simultaneously (AND logic)
- Show "X of Y sessions" count

## Empty State
When no results match: "No sessions found matching your filters."

## Implementation Notes
- Only applies when ole === 'operator'
- Client-side filtering (no backend changes needed)
- Use existing table structure
