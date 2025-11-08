import { loadStoredContent } from './storage.js';

// --- AI Grouping Logic (Simulated/Hybrid) ---
// This map assigns a strong category to common domains.
const DOMAIN_GROUPS = {
    'youtube.com': 'Media & Entertainment',
    'netflix.com': 'Media & Entertainment',
    'amazon.com': 'Shopping & E-commerce',
    'etsy.com': 'Shopping & E-commerce',
    'instagram.com': 'Social Media',
    'twitter.com': 'Social Media',
    'reddit.com': 'Social Media',
    'docs.google.com': 'Work Documents',
    'notion.so': 'Productivity',
    'github.com': 'Code & Development',
    'stackoverflow.com': 'Code & Development',
    'spotify.com': 'Music',
    'airbnb.com': 'Travel & Booking',
    'skyscanner.net': 'Travel & Booking'
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

        // 1. Domain Match: Check if the exact domain is in our list
        if (DOMAIN_GROUPS[domain]) {
            return DOMAIN_GROUPS[domain];
        }

        // 2. Keyword/Content Match: Use extracted content for deeper grouping
        if (title.includes('tutorial') || content.includes('function') || content.includes('variable')) {
            return 'Code & Development';
        }
        if (title.includes('news') || title.includes('report') || content.includes('economy') || content.includes('politics')) {
            return 'Current Events';
        }

        // 3. Fallback to Primary Domain: Use the root domain name (e.g., 'Google', 'Wikipedia')
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