/**
 * @fileoverview Text validation and sanitization utilities.
 *
 * Provides functions to:
 * - Detect URLs/links in text
 * - Strip URLs from text
 * - Validate text content for security
 *
 * @module shared/utils/textValidation
 */

/**
 * Regular expression to match URLs in text.
 * Matches:
 * - http:// and https:// URLs
 * - www. prefixed URLs
 * - Common domains (.com, .net, .org, etc.)
 */
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|co|gg|xyz|me|info|biz|dev|app|ai|tv|fm|ly|to|cc|link|click|site|online|store|shop|tech|cloud|digital|world|live|news|blog|page|space|zone|network|social|trade|finance|crypto|money|exchange|market|trading|invest|wallet|token|coin|nft|defi|dao|eth|btc|bnb|sol)[^\s]*/gi;

/**
 * Checks if text contains any URLs or links.
 *
 * @param text - The text to check
 * @returns True if the text contains URLs
 *
 * @example
 * containsUrl("Check out https://example.com") // true
 * containsUrl("Hello world") // false
 * containsUrl("Visit example.com") // true
 */
export function containsUrl(text: string): boolean {
  // Reset lastIndex to avoid issues with global regex flag
  URL_REGEX.lastIndex = 0;
  return URL_REGEX.test(text);
}

/**
 * Strips URLs from text, replacing them with "[link removed]".
 *
 * @param text - The text to sanitize
 * @returns Text with URLs replaced
 *
 * @example
 * stripUrls("Check out https://example.com for more")
 * // Returns: "Check out [link removed] for more"
 */
export function stripUrls(text: string): string {
  return text.replace(URL_REGEX, "[link removed]");
}

/**
 * Validates that text does not contain URLs.
 * Throws an error if URLs are found.
 *
 * @param text - The text to validate
 * @param fieldName - Name of the field (for error message)
 * @throws {Error} If text contains URLs
 *
 * @example
 * validateNoUrls("Hello world", "title") // OK
 * validateNoUrls("Visit example.com", "title") // throws Error
 */
export function validateNoUrls(text: string, fieldName: string): void {
  if (containsUrl(text)) {
    throw new Error(`${fieldName} cannot contain links or URLs`);
  }
}
