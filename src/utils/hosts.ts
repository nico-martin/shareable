/**
 * Get allowed hosts from environment variable
 */
export function getAllowedHosts(): string[] {
  const allowedHosts = process.env.ALLOWED_HOSTS || '';

  // If empty or *, allow all hosts
  if (!allowedHosts || allowedHosts.trim() === '*') {
    return [];
  }

  // Parse comma-separated list and clean up
  return allowedHosts
    .split(',')
    .map(host => host.trim())
    .filter(host => host.length > 0);
}

/**
 * Check if a URL is allowed based on allowed hosts configuration
 */
export function isUrlAllowed(url: string): boolean {
  const allowedHosts = getAllowedHosts();

  // If no allowed hosts configured, allow all (permissive mode)
  if (allowedHosts.length === 0) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const urlOrigin = `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`;

    // Check if the URL's origin matches any allowed host
    return allowedHosts.some(allowedHost => {
      // Normalize allowed host to origin format
      try {
        const allowedUrl = new URL(allowedHost);
        const allowedOrigin = `${allowedUrl.protocol}//${allowedUrl.hostname}${allowedUrl.port ? ':' + allowedUrl.port : ''}`;
        return urlOrigin === allowedOrigin;
      } catch {
        // If allowed host is just a domain, try to match it
        return urlObj.hostname === allowedHost || urlOrigin.includes(allowedHost);
      }
    });
  } catch {
    // Invalid URL
    return false;
  }
}
