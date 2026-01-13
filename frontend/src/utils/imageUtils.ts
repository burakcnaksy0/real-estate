
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Constructs the full URL for an image path.
 * Handles absolute URLs, relative paths, and backend-stored paths.
 * 
 * @param path The image path from the backend (could be absolute path, relative path, or full URL)
 * @returns The full URL to display the image, or undefined if path is missing
 */
export const getImageUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;

    // If it's already a full URL (e.g. Google profile picture), return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Remove /api suffix from base URL if present to point to root for static files
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

    // Clean the path: replace backslashes with forward slashes (fix Windows paths if any remain)
    // and remove leading slash if present to avoid double slashes with baseUrl
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }

    // If the path contains the full absolute system path (legacy data), try to extract relative part
    // This is a best-effort fix for existing data. 
    // Adjusted for standard "uploads" directory structure.
    if (cleanPath.includes('uploads/')) {
        const parts = cleanPath.split('uploads/');
        if (parts.length > 1) {
            cleanPath = 'uploads/' + parts[1];
        }
    }

    return `${baseUrl}/${cleanPath}`;
};
