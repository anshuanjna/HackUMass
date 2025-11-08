import { loadStoredContent } from './storage.js';

// --- AI Grouping Logic (Simulated/Hybrid) ---
const DOMAIN_GROUPS = {
    'youtube.com': 'Media & Entertainment',
    'reddit.com': 'Social Forums',
    'github.com': 'Code & Development',
    'stackoverflow.com': 'Code & Development',
    'linkedin.com': 'Professional Networking',
    'wikipedia.org': 'Research & Reference',
    'docs.google.com': 'Work Documents'
};

/**
 * Determines the smart group name for a given tab.
 * @param {object} tab - The tab object from chrome.tabs.query()
 * @param {string} contentText - The previously stored/extracted content text for deeper analysis
 * @returns {string} The suggested group name.
 */
export function getGroupName(tab, contentText = "") {
    if (!tab.url) return 'Unknown';

    try {
        const url = new URL(tab.url);
        const domain = url.hostname.replace(/^www\./, '');
        const title = tab.title.toLowerCase();
        const content = contentText.toLowerCase();

        // 1. Domain Match
        if (DOMAIN_GROUPS[domain]) {
            return DOMAIN_GROUPS[domain];
        }

        // 2. Keyword/Content Match
        if (title.includes('tutorial') || content.includes('function') || content.includes('variable')) {
            return 'Code & Development';
        }
        if (title.includes('news') || title.includes('report') || content.includes('economy') || content.includes('politics')) {
            return 'Current Events';
        }

        // 3. Fallback to Primary Domain
        const parts = domain.split('.');
        if (parts.length >= 2) {
            const mainDomain = parts[parts.length - 2];
            // Capitalize the main part
            return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
        }
    } catch (e) {
        // Handle non-standard URLs like chrome://
    }

    return 'Miscellaneous';
}