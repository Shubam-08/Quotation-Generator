/**
 * Utility functions for IP Rating to Application mapping
 */

/**
 * Extracts numeric value from IP rating string
 * Examples: "IP20" -> 20, "IP65" -> 65, "IP67/IP68" -> 67
 */
export function extractIpNumber(ipRating: string): number | null {
  if (!ipRating) return null;
  
  // Handle multiple IP ratings (e.g., "IP67/IP68") - take the first one
  const firstRating = ipRating.split('/')[0].trim();
  
  // Extract numeric part (e.g., "IP65" -> "65")
  const match = firstRating.match(/IP\s*(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Determines application based on IP rating
 * IP20-IP44: Indoor
 * IP45-IP54: Indoor/Outdoor
 * IP55-IP69: Outdoor
 * Default: Indoor
 */
export function getApplicationFromIpRating(ipRating: string | string[] | undefined): string {
  if (!ipRating) return 'Indoor';
  
  // Handle array of IP ratings
  let ratingToCheck: string;
  if (Array.isArray(ipRating)) {
    if (ipRating.length === 0) return 'Indoor';
    ratingToCheck = ipRating[0]; // Use first rating
  } else {
    ratingToCheck = ipRating;
  }
  
  const ipNumber = extractIpNumber(ratingToCheck);
  
  if (ipNumber === null) return 'Indoor';
  
  if (ipNumber >= 20 && ipNumber <= 44) {
    return 'Indoor';
  } else if (ipNumber >= 45 && ipNumber <= 54) {
    return 'Indoor/Outdoor';
  } else if (ipNumber >= 55 && ipNumber <= 69) {
    return 'Outdoor';
  }
  
  // Default to Indoor for any other cases
  return 'Indoor';
}

/**
 * Determines application from ipRatings array (new structure with prices)
 */
export function getApplicationFromIpRatings(ipRatings: Array<{ rating: string; price: number }> | undefined): string {
  if (!ipRatings || ipRatings.length === 0) return 'Indoor';
  
  // Get all IP numbers
  const ipNumbers = ipRatings
    .map(item => extractIpNumber(item.rating))
    .filter((num): num is number => num !== null);
  
  if (ipNumbers.length === 0) return 'Indoor';
  
  // Use the highest IP rating to determine application
  const maxIpNumber = Math.max(...ipNumbers);
  
  if (maxIpNumber >= 20 && maxIpNumber <= 44) {
    return 'Indoor';
  } else if (maxIpNumber >= 45 && maxIpNumber <= 54) {
    return 'Indoor/Outdoor';
  } else if (maxIpNumber >= 55 && maxIpNumber <= 69) {
    return 'Outdoor';
  }
  
  return 'Indoor';
}
