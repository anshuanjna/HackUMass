/**
 * Utility functions for the background script.
 */

// Generate a random color for the tab group
//export function getRandomColor() {
  //const colors = ["blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
  //return colors[Math.floor(Math.random() * colors.length)];
//}

// Convert milliseconds to a readable format (Hh Mmin)
export function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let formatted = '';
    if (hours > 0) {
        formatted += `${hours}h `;
    }
    if (minutes > 0 || (hours === 0 && totalSeconds > 0)) {
        formatted += `${minutes}min`;
    }
    
    // If less than a minute but some time, just show seconds
    if (totalSeconds < 60 && totalSeconds > 0) {
        return `${totalSeconds}s`;
    }

    return formatted.trim() || '0min';
}