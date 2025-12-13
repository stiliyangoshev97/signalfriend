/**
 * Social Links Configuration
 *
 * Reads social media links and contact info from environment variables.
 * Falls back to default values if not set.
 *
 * To update links, change the values in .env.local:
 * - VITE_DISCORD_URL
 * - VITE_TWITTER_URL
 * - VITE_CONTACT_EMAIL
 *
 * @module shared/config/social
 */

export const socialLinks = {
  /**
   * Discord server invite URL
   * REQUIRED: Set in .env.local: VITE_DISCORD_URL=https://discord.gg/your-invite-code
   */
  discord: import.meta.env.VITE_DISCORD_URL || '',

  /**
   * Twitter/X profile URL
   * Update in .env.local: VITE_TWITTER_URL=https://x.com/your-handle
   */
  twitter: import.meta.env.VITE_TWITTER_URL || 'https://x.com/signalfriend1',

  /**
   * Contact email address
   * Update in .env.local: VITE_CONTACT_EMAIL=your@email.com
   */
  email: import.meta.env.VITE_CONTACT_EMAIL || 'contact@signalfriend.com',
} as const;
