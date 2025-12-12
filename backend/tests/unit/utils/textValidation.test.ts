/**
 * @fileoverview Unit tests for text validation utilities.
 *
 * Tests URL detection, stripping, and validation functions
 * used to prevent spam and malicious content.
 *
 * Note: The URL_REGEX uses the global flag (g), which means each test
 * should use fresh strings to avoid lastIndex state issues.
 *
 * @module tests/unit/utils/textValidation.test
 */

import { describe, it, expect } from "vitest";
import {
  containsUrl,
  stripUrls,
  validateNoUrls,
} from "../../../src/shared/utils/textValidation.js";

describe("textValidation utilities", () => {
  describe("containsUrl", () => {
    describe("should detect http/https URLs", () => {
      it("should detect http:// URLs", () => {
        expect(containsUrl("Check out http://example.com")).toBe(true);
      });

      it("should detect https:// URLs", () => {
        expect(containsUrl("Visit https://site.org/page")).toBe(true);
      });

      it("should detect URLs with paths", () => {
        expect(containsUrl("Go to https://mysite.net/path/to/page")).toBe(true);
      });

      it("should detect URLs with query parameters", () => {
        expect(containsUrl("Link: https://app.io?param=value&foo=bar")).toBe(true);
      });

      it("should detect URLs with ports", () => {
        expect(containsUrl("API at http://localhost:3000/api")).toBe(true);
      });
    });

    describe("should detect www URLs", () => {
      it("should detect www. prefixed URLs", () => {
        expect(containsUrl("Go visit www.mywebsite.com today")).toBe(true);
      });

      it("should detect www with paths", () => {
        expect(containsUrl("Check www.mysite.com/products")).toBe(true);
      });
    });

    describe("should detect bare domain URLs", () => {
      it("should detect .com domains", () => {
        expect(containsUrl("Check mywebsite.com today")).toBe(true);
      });

      it("should detect .net domains", () => {
        expect(containsUrl("Visit mysite.net for more")).toBe(true);
      });

      it("should detect .org domains", () => {
        expect(containsUrl("See nonprofit.org")).toBe(true);
      });

      it("should detect .io domains", () => {
        expect(containsUrl("Use myapp.io for this")).toBe(true);
      });

      it("should detect .gg domains", () => {
        expect(containsUrl("Join server.gg/invite123")).toBe(true);
      });

      it("should detect .xyz domains", () => {
        expect(containsUrl("Check token.xyz now")).toBe(true);
      });
    });

    describe("should detect crypto-related domains", () => {
      it("should detect .crypto domains", () => {
        expect(containsUrl("Get your name.crypto")).toBe(true);
      });

      it("should detect .eth domains", () => {
        expect(containsUrl("ENS: myname.eth is taken")).toBe(true);
      });

      it("should detect .nft domains", () => {
        expect(containsUrl("My art.nft collection")).toBe(true);
      });

      it("should detect .defi domains", () => {
        expect(containsUrl("Trade on best.defi platform")).toBe(true);
      });

      it("should detect .exchange domains", () => {
        expect(containsUrl("Use new.exchange for trading")).toBe(true);
      });

      it("should detect .wallet domains", () => {
        expect(containsUrl("Secure your.wallet today")).toBe(true);
      });
    });

    describe("should NOT detect non-URL text", () => {
      it("should return false for plain text", () => {
        expect(containsUrl("Hello world")).toBe(false);
      });

      it("should return false for text with numbers", () => {
        expect(containsUrl("Buy signal #123 for $50")).toBe(false);
      });

      it("should return false for text with periods in sentences", () => {
        expect(containsUrl("I bought it. It was good.")).toBe(false);
      });

      it("should return false for empty string", () => {
        expect(containsUrl("")).toBe(false);
      });

      it("should return false for text with percentages", () => {
        expect(containsUrl("Profit target: 15.5%")).toBe(false);
      });

      it("should return false for version numbers", () => {
        expect(containsUrl("Version 2.0.1 released")).toBe(false);
      });

      it("should return false for decimal numbers", () => {
        expect(containsUrl("Price is $45.99 per unit")).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("should detect multiple URLs in same text", () => {
        expect(
          containsUrl("Visit first.com and also second.net for more info")
        ).toBe(true);
      });

      it("should detect URL at the start", () => {
        expect(containsUrl("https://starting.io is the place")).toBe(true);
      });

      it("should detect URL at the end", () => {
        expect(containsUrl("For more info visit ending.com")).toBe(true);
      });
    });
  });

  describe("stripUrls", () => {
    it("should replace https URLs with [link removed]", () => {
      const result = stripUrls("Visit https://remove.me/now for info");
      expect(result).toContain("[link removed]");
      expect(result).not.toContain("remove.me");
    });

    it("should replace http URLs", () => {
      const result = stripUrls("Check http://old.site.net today");
      expect(result).toContain("[link removed]");
      expect(result).not.toContain("old.site");
    });

    it("should replace bare domain URLs", () => {
      const result = stripUrls("Go to mybare.com today");
      expect(result).toContain("[link removed]");
      expect(result).not.toContain("mybare.com");
    });

    it("should replace www URLs", () => {
      const result = stripUrls("Check www.worldwideweb.net now");
      expect(result).toContain("[link removed]");
      expect(result).not.toContain("worldwideweb");
    });

    it("should preserve non-URL text", () => {
      const result = stripUrls("Hello world, no links here!");
      expect(result).toBe("Hello world, no links here!");
    });

    it("should handle text that is only a URL", () => {
      const result = stripUrls("https://onlyurl.io");
      expect(result).toBe("[link removed]");
    });

    it("should replace multiple URLs", () => {
      const result = stripUrls(
        "Visit first.com and second.net today"
      );
      expect(result).not.toContain("first.com");
      expect(result).not.toContain("second.net");
      // Should have at least one [link removed]
      expect(result).toContain("[link removed]");
    });
  });

  describe("validateNoUrls", () => {
    it("should not throw for text without URLs", () => {
      expect(() => {
        validateNoUrls("Hello world, just plain text here", "title");
      }).not.toThrow();
    });

    it("should throw for text with https URLs", () => {
      expect(() => {
        validateNoUrls("Check https://badsite.com/scam now", "title");
      }).toThrow();
    });

    it("should throw for text with http URLs", () => {
      expect(() => {
        validateNoUrls("Go to http://malware.net today", "description");
      }).toThrow();
    });

    it("should include field name in error message", () => {
      try {
        validateNoUrls("Visit spam.com now", "myField");
        expect.fail("Should have thrown");
      } catch (error) {
        expect((error as Error).message).toContain("myField");
        expect((error as Error).message).toContain("cannot contain links");
      }
    });

    it("should throw for bare domain URLs", () => {
      expect(() => {
        validateNoUrls("Check scam.net for deals", "content");
      }).toThrow();
    });

    it("should throw for crypto domain URLs", () => {
      expect(() => {
        validateNoUrls("Buy at fake.crypto now", "signalName");
      }).toThrow();
    });

    it("should throw for www URLs", () => {
      expect(() => {
        validateNoUrls("Visit www.phishing.com today", "bio");
      }).toThrow();
    });

    it("should not throw for empty string", () => {
      expect(() => {
        validateNoUrls("", "field");
      }).not.toThrow();
    });

    it("should not throw for normal sentences with periods", () => {
      expect(() => {
        validateNoUrls("I made $500. It was great. Very happy.", "description");
      }).not.toThrow();
    });

    it("should not throw for version numbers", () => {
      expect(() => {
        validateNoUrls("Updated to version 2.5.1 today", "notes");
      }).not.toThrow();
    });
  });
});
