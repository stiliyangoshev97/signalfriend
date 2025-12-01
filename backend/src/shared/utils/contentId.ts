/**
 * @fileoverview Utility functions for contentId conversion.
 *
 * Handles conversion between:
 * - UUID format (backend): "550e8400-e29b-41d4-a716-446655440000"
 * - bytes32 format (blockchain): "0x550e8400e29b41d4a716446655440000..."
 *
 * The UUID is stored in the first 16 bytes of the bytes32, with the
 * remaining 16 bytes padded with zeros.
 *
 * @module shared/utils/contentId
 */

/**
 * Converts a UUID string to a bytes32 hex string for on-chain use.
 *
 * @param uuid - UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * @returns bytes32 hex string (e.g., "0x550e8400e29b41d4a716446655440000...")
 *
 * @example
 * uuidToBytes32("550e8400-e29b-41d4-a716-446655440000")
 * // Returns: "0x550e8400e29b41d4a7164466554400000000000000000000000000000000"
 */
export function uuidToBytes32(uuid: string): string {
  // Remove dashes from UUID
  const hex = uuid.replace(/-/g, "");

  // UUID is 32 hex chars (16 bytes), bytes32 needs 64 hex chars (32 bytes)
  // Pad with zeros on the right
  const padded = hex.padEnd(64, "0");

  return `0x${padded}`;
}

/**
 * Converts a bytes32 hex string from the blockchain to a UUID string.
 *
 * @param bytes32 - bytes32 hex string (e.g., "0x550e8400e29b41d4a716446655440000...")
 * @returns UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 *
 * @example
 * bytes32ToUuid("0x550e8400e29b41d4a7164466554400000000000000000000000000000000")
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export function bytes32ToUuid(bytes32: string): string {
  // Remove 0x prefix and take first 32 chars (16 bytes = UUID length)
  const hex = bytes32.slice(2, 34);

  // Insert dashes at UUID positions: 8-4-4-4-12
  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");

  return uuid;
}

/**
 * Validates if a string is a valid UUID format.
 *
 * @param str - String to validate
 * @returns true if valid UUID format
 */
export function isValidUuid(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validates if a string is a valid bytes32 hex format.
 *
 * @param str - String to validate
 * @returns true if valid bytes32 format
 */
export function isValidBytes32(str: string): boolean {
  const bytes32Regex = /^0x[0-9a-f]{64}$/i;
  return bytes32Regex.test(str);
}
