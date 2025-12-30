/**
 * @fileoverview Custom hook for managing SEO meta tags dynamically.
 *
 * Provides a way to update document title and meta tags on a per-page basis.
 * Works with React 19 without external dependencies.
 *
 * @module shared/hooks/useSEO
 *
 * @example
 * ```tsx
 * // Basic usage - just title
 * useSEO({ title: 'Signals' });
 *
 * // Full usage with all options
 * useSEO({
 *   title: 'BTC Signal - Buy Now',
 *   description: 'Premium Bitcoin trading signal from verified predictor',
 *   image: 'https://signalfriend.io/signal-preview.png',
 *   url: 'https://signalfriend.io/signals/abc123',
 *   type: 'article'
 * });
 * ```
 */

import { useEffect } from 'react';

/** Default site name appended to page titles */
const SITE_NAME = 'SignalFriend';

/** Default description used as fallback */
const DEFAULT_DESCRIPTION =
  'Get expert analysis for prediction market events. Access premium signals from verified predictors covering crypto, politics, sports, and more. Powered by BNB Chain.';

/** Default OG image */
const DEFAULT_IMAGE = 'https://signalfriend.com/og-image.jpg?v=3';

/** Base URL for the site */
const BASE_URL = 'https://signalfriend.com';

/**
 * SEO configuration options
 */
export interface SEOOptions {
  /** Page title (will be appended with " | SignalFriend") */
  title?: string;
  /** Page description for search engines and social shares */
  description?: string;
  /** OG image URL for social media previews */
  image?: string;
  /** Canonical URL for the page */
  url?: string;
  /** OG type (website, article, profile) */
  type?: 'website' | 'article' | 'profile';
  /** Prevent search engine indexing */
  noIndex?: boolean;
}

/**
 * Updates or creates a meta tag in the document head.
 *
 * @param attribute - The attribute to identify the meta tag (name or property)
 * @param value - The attribute value
 * @param content - The content value for the meta tag
 */
function setMetaTag(
  attribute: 'name' | 'property',
  value: string,
  content: string
): void {
  // Find existing tag
  let element = document.querySelector(
    `meta[${attribute}="${value}"]`
  ) as HTMLMetaElement | null;

  if (element) {
    // Update existing
    element.content = content;
  } else {
    // Create new
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    element.content = content;
    document.head.appendChild(element);
  }
}

/**
 * Updates the canonical link in the document head.
 *
 * @param url - The canonical URL
 */
function setCanonicalUrl(url: string): void {
  let link = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;

  if (link) {
    link.href = url;
  } else {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    document.head.appendChild(link);
  }
}

/**
 * Custom hook for managing SEO meta tags.
 *
 * Updates document title and various meta tags when called.
 * Automatically cleans up and restores defaults on unmount.
 *
 * @param options - SEO configuration options
 *
 * @example
 * ```tsx
 * function SignalsPage() {
 *   useSEO({
 *     title: 'Trading Signals',
 *     description: 'Browse premium trading signals from verified predictors'
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSEO(options: SEOOptions): void {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    noIndex = false,
  } = options;

  useEffect(() => {
    // Store original title to restore on unmount
    const originalTitle = document.title;

    // Set document title
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    // Primary meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'title', document.title);

    // Robots
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Open Graph
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', document.title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    if (url) {
      setMetaTag('property', 'og:url', url);
      setCanonicalUrl(url);
    }

    // Twitter
    setMetaTag('property', 'twitter:title', document.title);
    setMetaTag('property', 'twitter:description', description);
    setMetaTag('property', 'twitter:image', image);
    if (url) {
      setMetaTag('property', 'twitter:url', url);
    }

    // Cleanup: restore original title on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [title, description, image, url, type, noIndex]);
}

/**
 * Generates a full URL for SEO purposes.
 *
 * @param path - The path to append to the base URL
 * @returns The full URL
 *
 * @example
 * ```ts
 * getSEOUrl('/signals/abc123'); // "https://signalfriend.io/signals/abc123"
 * ```
 */
export function getSEOUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export default useSEO;
