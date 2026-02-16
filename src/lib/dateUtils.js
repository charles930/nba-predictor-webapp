// Date utility functions for NBA Predictor

/**
 * Convert UTC datetime to ET (Eastern Time) formatted string
 * @param {string} utcDatetimeStr - ISO format UTC datetime (e.g., "2026-02-20T00:00:00.000Z")
 * @returns {string} - Formatted time string (e.g., "7:00 PM ET")
 */
export function formatGameTimeET(utcDatetimeStr) {
  if (!utcDatetimeStr) {
    return 'TBD';
  }

  try {
    // Parse the UTC datetime
    const utcDate = new Date(utcDatetimeStr);
    
    // Convert UTC to ET (Eastern Time)
    // UTC to ET is UTC-5 (EST) or UTC-4 (EDT)
    // For simplicity, we check if daylight saving is in effect
    const etDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // Format as HH:MM AM/PM ET
    const timeStr = etDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
    
    return `${timeStr} ET`;
  } catch (error) {
    console.error('Error formatting game time:', error);
    return 'TBD';
  }
}

/**
 * Extract just the time part from datetime
 * @param {string} utcDatetimeStr - ISO format UTC datetime
 * @returns {string} - Time in format "7:00 PM"
 */
export function getGameTimeOnly(utcDatetimeStr) {
  if (!utcDatetimeStr) {
    return 'TBD';
  }

  try {
    const utcDate = new Date(utcDatetimeStr);
    const timeStr = utcDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
    
    return timeStr;
  } catch (error) {
    console.error('Error extracting game time:', error);
    return 'TBD';
  }
}
