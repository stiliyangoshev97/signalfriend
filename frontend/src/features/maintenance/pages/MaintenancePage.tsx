/**
 * Maintenance Page
 *
 * Displayed when the site is under maintenance.
 * Shows a friendly message with expected downtime information.
 *
 * To enable maintenance mode:
 * 1. Set VITE_MAINTENANCE_MODE=true in .env.local
 * 2. Optionally set VITE_MAINTENANCE_MESSAGE for custom message
 * 3. Optionally set VITE_MAINTENANCE_END_TIME for expected end time
 *
 * @module features/maintenance/pages/MaintenancePage
 */

import { socialLinks } from '@/shared/config/social';

export function MaintenancePage() {
  // Custom message from environment variable
  const customMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE;
  const endTime = import.meta.env.VITE_MAINTENANCE_END_TIME;

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo-bg-removed.png"
            alt="SignalFriend"
            className="h-24 w-24 mx-auto rounded-xl object-contain"
          />
        </div>

        {/* Maintenance Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-fur-yellow/10 rounded-full">
            <svg
              className="w-10 h-10 text-fur-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-fur-cream mb-4">
          We'll Be Right Back
        </h1>

        {/* Description */}
        <p className="text-gray-main text-lg mb-6">
          {customMessage ||
            "SignalFriend is currently undergoing scheduled maintenance. We're working hard to improve your experience."}
        </p>

        {/* End Time */}
        {endTime && (
          <div className="bg-dark-800 rounded-lg p-4 mb-8 border border-dark-600">
            <p className="text-fur-cream/60 text-sm mb-1">
              Expected to be back by
            </p>
            <p className="text-fur-yellow font-semibold text-lg">{endTime}</p>
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center justify-center gap-6">
          <a
            href={socialLinks.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-main hover:text-fur-cream transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Discord
          </a>
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-main hover:text-fur-cream transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter
          </a>
        </div>

        {/* Footer */}
        <p className="text-fur-cream/40 text-sm mt-12">
          © {new Date().getFullYear()} SignalFriend. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default MaintenancePage;
