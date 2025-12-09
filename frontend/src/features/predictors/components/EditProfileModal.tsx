/**
 * @fileoverview Edit Profile Modal Component
 * @module features/predictors/components/EditProfileModal
 * @description
 * Modal for predictors to edit their profile information:
 * - Display Name
 * - Avatar URL
 * - Bio
 * - Twitter/X handle (public)
 * - Telegram handle (admin/self only)
 * - Discord handle (admin/self only)
 * - Preferred contact method
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input, Textarea } from '@/shared/components/ui';
import { useUpdateProfile, useCheckFieldUniqueness } from '../hooks';
import type { Predictor } from '@/shared/types';

// ===========================================
// Validation Schema
// ===========================================

/** Regex pattern to detect URLs/links in text */
const urlPattern = /(https?:\/\/|www\.|\.com|\.org|\.net|\.io|\.xyz|\.gg|t\.me|discord\.gg)/i;

/** Allowed image file extensions (security: no SVG!) */
const allowedImageExtensions = /\.(jpg|jpeg|png|gif)(\?.*)?$/i;

/**
 * Reserved display names that cannot be used.
 * These names could be used for impersonation or confusion.
 * Must match backend validation in predictor.schemas.ts
 */
const RESERVED_DISPLAY_NAMES = [
  'admin',
  'administrator',
  'signalfriend',
  'signal_friend',
  'signal-friend',
  'signalfriend_admin',
  'signalfriend_administrator',
  'signalfriend_mod',
  'signalfriend_moderator',
  'signalfriend_support',
  'signalfriend_official',
  'signalfriend_team',
  'moderator',
  'mod',
  'support',
  'help',
  'official',
  'team',
  'staff',
  'system',
  'bot',
  'root',
  'owner',
  'founder',
  'ceo',
  'cto',
  'developer',
  'dev',
];

/**
 * Checks if a display name is reserved/prohibited.
 * Performs case-insensitive check and also checks for partial matches.
 * @param name - The display name to check
 * @returns true if the name is reserved, false otherwise
 */
function isReservedDisplayName(name: string): boolean {
  const lowerName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return RESERVED_DISPLAY_NAMES.some(
    (reserved) => {
      const normalizedReserved = reserved.replace(/[^a-z0-9]/g, '');
      return (
        lowerName === normalizedReserved ||
        lowerName.startsWith(normalizedReserved) ||
        lowerName.includes('signalfriend')
      );
    }
  );
}

/**
 * Reserved social media handles that cannot be used.
 * Prevents impersonation of the official SignalFriend accounts.
 * Official accounts:
 * - Twitter: @signalfriend1
 * - Discord: signalfriend.com
 * - Telegram: (platform official channels)
 */
const RESERVED_SOCIAL_HANDLES = [
  'signalfriend',
  'signalfriend1',
  'signalfriend2',
  'signal_friend',
  'signal-friend',
  'signalfriendofficial',
  'signalfriend_official',
  'signalfriendadmin',
  'signalfriend_admin',
  'signalfriendmod',
  'signalfriend_mod',
  'signalfriendteam',
  'signalfriend_team',
  'signalfriendsupport',
  'signalfriend_support',
  'signalfriendhelp',
  'signalfriend_help',
  'signalfriend.com',
  'signalfriendcom',
];

/**
 * Checks if a social handle is reserved/prohibited.
 * Prevents users from impersonating official SignalFriend accounts.
 * @param handle - The social handle to check
 * @returns true if the handle is reserved, false otherwise
 */
function isReservedSocialHandle(handle: string): boolean {
  if (!handle) return false;
  const normalizedHandle = handle.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return (
    RESERVED_SOCIAL_HANDLES.some(
      (reserved) => normalizedHandle === reserved.toLowerCase().replace(/[^a-z0-9.]/g, '')
    ) ||
    normalizedHandle.includes('signalfriend')
  );
}

const editProfileSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Display name must be at least 3 characters')
    .max(30, 'Display name must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .refine(
      (val) => !isReservedDisplayName(val),
      'This display name is reserved and cannot be used'
    ),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .refine((val) => !val || !urlPattern.test(val), 'Bio cannot contain links or URLs')
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .max(500, 'URL is too long (max 500 characters). Use a direct image link from postimages.org or similar.')
    .url('Please enter a valid image URL (must start with http:// or https://)')
    .refine(
      (val) => !val || allowedImageExtensions.test(val),
      'Only JPG, PNG, and GIF images are allowed (no SVG for security reasons)'
    )
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .max(50, 'Twitter handle too long')
    .regex(/^[a-zA-Z0-9_]*$/, 'Only letters, numbers, and underscores allowed')
    .refine(
      (val) => !val || !isReservedSocialHandle(val),
      'This Twitter handle is reserved and cannot be used'
    )
    .optional()
    .or(z.literal('')),
  telegram: z
    .string()
    .min(1, 'Telegram handle is required')
    .max(32, 'Telegram handle too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .refine(
      (val) => !isReservedSocialHandle(val),
      'This Telegram handle is reserved and cannot be used'
    ),
  discord: z
    .string()
    .min(1, 'Discord handle is required')
    .max(32, 'Discord handle too long')
    .refine(
      (val) => !isReservedSocialHandle(val),
      'This Discord handle is reserved and cannot be used'
    ),
  preferredContact: z.enum(['telegram', 'discord']),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

// ===========================================
// Props
// ===========================================

interface EditProfileModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Current predictor data to pre-fill form */
  predictor: Predictor | null;
  /** Callback after successful update */
  onSuccess?: () => void;
}

// ===========================================
// Component
// ===========================================

/**
 * EditProfileModal - Modal for editing predictor profile
 * 
 * Features:
 * - Pre-fills form with current predictor data
 * - Validates input with Zod schema
 * - Shows loading state during submission
 * - Closes on successful update
 * 
 * Privacy Note:
 * - Twitter/X is publicly visible on profile
 * - Telegram & Discord are only visible to admin and the predictor
 */
export function EditProfileModal({
  isOpen,
  onClose,
  predictor,
  onSuccess,
}: EditProfileModalProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: {
      displayName: '',
      bio: '',
      avatarUrl: '',
      twitter: '',
      telegram: '',
      discord: '',
      preferredContact: 'discord',
    },
  });

  // Watch values for real-time validation
  const displayNameValue = watch('displayName') || '';
  const telegramValue = watch('telegram') || '';
  const discordValue = watch('discord') || '';
  const bioValue = watch('bio') || '';

  // Real-time uniqueness checks (only when modal is open and field is different from current)
  const shouldCheckDisplayName = isOpen && 
    !predictor?.displayNameChanged && 
    displayNameValue !== '' && 
    displayNameValue !== predictor?.displayName;
  
  const shouldCheckTelegram = isOpen && 
    telegramValue !== '' && 
    telegramValue !== (predictor?.socialLinks?.telegram || '');
  
  const shouldCheckDiscord = isOpen && 
    discordValue !== '' && 
    discordValue !== (predictor?.socialLinks?.discord || '');

  const { 
    isAvailable: displayNameAvailable, 
    isChecking: isCheckingDisplayName,
    error: displayNameError 
  } = useCheckFieldUniqueness(
    'displayName', 
    shouldCheckDisplayName ? displayNameValue : ''
  );

  const { 
    isAvailable: telegramAvailable, 
    isChecking: isCheckingTelegram,
    error: telegramError 
  } = useCheckFieldUniqueness(
    'telegram', 
    shouldCheckTelegram ? telegramValue : ''
  );

  const { 
    isAvailable: discordAvailable, 
    isChecking: isCheckingDiscord,
    error: discordError 
  } = useCheckFieldUniqueness(
    'discord', 
    shouldCheckDiscord ? discordValue : ''
  );

  // Check if any uniqueness checks are failing
  const hasUniquenessError = 
    (shouldCheckDisplayName && displayNameAvailable === false) ||
    (shouldCheckTelegram && telegramAvailable === false) ||
    (shouldCheckDiscord && discordAvailable === false);

  const isCheckingUniqueness = isCheckingDisplayName || isCheckingTelegram || isCheckingDiscord;

  // Pre-fill form when predictor data changes
  useEffect(() => {
    if (predictor && isOpen) {
      // Default to 'discord' if preferredContact is not set or is an invalid value
      const validPreferredContact = 
        predictor.preferredContact === 'telegram' || predictor.preferredContact === 'discord'
          ? predictor.preferredContact
          : 'discord';
      
      reset({
        displayName: predictor.displayName || '',
        bio: predictor.bio || '',
        avatarUrl: predictor.avatarUrl || '',
        twitter: predictor.socialLinks?.twitter || '',
        telegram: predictor.socialLinks?.telegram || '',
        discord: predictor.socialLinks?.discord || '',
        preferredContact: validPreferredContact,
      });
    }
  }, [predictor, isOpen, reset]);

  const onSubmit = (data: EditProfileFormData) => {
    setError(null);

    // Build update payload - only include changed/non-empty fields
    const payload: Parameters<typeof updateProfile>[0] = {};

    if (data.displayName && data.displayName !== predictor?.displayName) {
      payload.displayName = data.displayName;
    }
    if (data.bio !== undefined && data.bio !== (predictor?.bio || '')) {
      payload.bio = data.bio || '';
    }
    if (data.avatarUrl !== undefined && data.avatarUrl !== (predictor?.avatarUrl || '')) {
      payload.avatarUrl = data.avatarUrl || '';
    }
    
    // Build socialLinks object
    const socialLinks: { twitter?: string; telegram?: string; discord?: string } = {};
    if (data.twitter !== undefined && data.twitter !== (predictor?.socialLinks?.twitter || '')) {
      socialLinks.twitter = data.twitter || '';
    }
    if (data.telegram !== undefined && data.telegram !== (predictor?.socialLinks?.telegram || '')) {
      socialLinks.telegram = data.telegram || '';
    }
    if (data.discord !== undefined && data.discord !== (predictor?.socialLinks?.discord || '')) {
      socialLinks.discord = data.discord || '';
    }
    if (Object.keys(socialLinks).length > 0) {
      payload.socialLinks = socialLinks;
    }

    if (data.preferredContact && data.preferredContact !== predictor?.preferredContact) {
      payload.preferredContact = data.preferredContact;
    }

    // If nothing changed, just close
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
      onError: (err: unknown) => {
        // Extract error message from API response
        let message = 'Failed to update profile';
        if (err && typeof err === 'object') {
          // Check for Axios error response
          const axiosErr = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
          if (axiosErr.response?.data?.message) {
            message = axiosErr.response.data.message;
          } else if (axiosErr.response?.data?.error) {
            message = axiosErr.response.data.error;
          } else if (axiosErr.message) {
            message = axiosErr.message;
          }
        }
        setError(message);
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-error-500/20 border border-error-500/50 rounded-lg text-error-400 text-sm">
            {error}
          </div>
        )}

        {/* Required Fields Notice */}
        <div className="flex items-center gap-2 p-2 bg-dark-700/50 rounded-md border border-dark-600 text-xs text-fur-cream/60">
          <span className="text-accent-red">*</span>
          <span>Required fields must be filled to save changes</span>
        </div>

        {/* Display Name Section */}
        <div className="space-y-2">
          <div className="relative">
            <label className="block text-sm font-medium text-fur-cream mb-1.5">
              Display Name <span className="text-accent-red">*</span>
            </label>
            <Input
              placeholder="e.g., CryptoKing"
              {...register('displayName')}
              error={errors.displayName?.message || displayNameError || undefined}
              disabled={predictor?.displayNameChanged}
            />
            {/* Uniqueness check indicator */}
            {shouldCheckDisplayName && (
              <div className="absolute right-3 top-9">
                {isCheckingDisplayName ? (
                  <svg className="w-4 h-4 animate-spin text-fur-cream/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : displayNameAvailable === true ? (
                  <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : displayNameAvailable === false ? (
                  <svg className="w-4 h-4 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            )}
          </div>
          {predictor?.displayNameChanged ? (
            <div className="flex items-center gap-2 p-2 bg-dark-700/50 rounded-md border border-dark-600">
              <svg className="w-4 h-4 text-fur-cream/50 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-fur-cream/50">
                Display name is locked. It can only be changed once.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-2 bg-warning-500/10 rounded-md border border-warning-500/30">
              <svg className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-xs">
                <span className="text-warning-400 font-medium">One-time change only!</span>
                <span className="text-fur-cream/60"> Display name can only be set once. Choose carefully.</span>
                <div className="mt-1 text-fur-cream/40">{displayNameValue.length}/30 • Letters, numbers, underscores only</div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar URL */}
        <div className="space-y-1.5">
          <Input
            label="Avatar URL"
            placeholder="https://i.postimg.cc/your-image.png"
            {...register('avatarUrl')}
            error={errors.avatarUrl?.message}
          />
          <p className="text-xs text-fur-cream/50">
            Direct link to an image (PNG, JPG, or GIF only). 
            <span className="text-fur-cream/70"> Need to host an image? Use </span>
            <a 
              href="https://postimages.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-200 hover:text-brand-100 underline"
            >
              postimages.org
            </a>
            <span className="text-fur-cream/70"> (free, no signup required)</span>
          </p>
        </div>

        {/* Bio */}
        <div>
          <Textarea
            label="Bio"
            placeholder="Tell buyers about your trading experience and expertise..."
            rows={4}
            {...register('bio')}
            error={errors.bio?.message}
          />
          <div className="mt-1 flex justify-between text-xs text-fur-cream/40">
            <span>No links allowed</span>
            <span>{bioValue.length}/500 characters</span>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="pt-4 border-t border-dark-600">
          <h3 className="text-sm font-medium text-fur-cream mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Social Links
          </h3>
        </div>

        {/* Twitter - Public */}
        <div>
          <label className="block text-sm font-medium text-fur-cream mb-1.5">
            Twitter / X
            <span className="ml-2 text-xs font-normal px-1.5 py-0.5 bg-brand-200/20 text-brand-200 rounded">Public</span>
          </label>
          <Input
            placeholder="username (without @)"
            {...register('twitter')}
            error={errors.twitter?.message}
            helperText="Visible to everyone on your profile"
          />
        </div>

        {/* Private Contact Info */}
        <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600 space-y-4">
          <div className="flex items-center gap-2 text-xs text-fur-cream/60">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Private - Only visible to you and platform admins</span>
          </div>

          {/* Telegram - Private */}
          <div className="relative">
            <label className="block text-sm font-medium text-fur-cream mb-1.5">
              Telegram <span className="text-accent-red">*</span>
            </label>
            <Input
              placeholder="username (without @)"
              {...register('telegram')}
              error={errors.telegram?.message || telegramError || undefined}
              helperText="Must be unique across all predictors"
            />
            {/* Uniqueness check indicator */}
            {shouldCheckTelegram && (
              <div className="absolute right-3 top-9">
                {isCheckingTelegram ? (
                  <svg className="w-4 h-4 animate-spin text-fur-cream/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : telegramAvailable === true ? (
                  <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : telegramAvailable === false ? (
                  <svg className="w-4 h-4 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            )}
          </div>

          {/* Discord - Private */}
          <div className="relative">
            <label className="block text-sm font-medium text-fur-cream mb-1.5">
              Discord <span className="text-accent-red">*</span>
            </label>
            <Input
              placeholder="username"
              {...register('discord')}
              error={errors.discord?.message || discordError || undefined}
              helperText="Must be unique across all predictors"
            />
            {/* Uniqueness check indicator */}
            {shouldCheckDiscord && (
              <div className="absolute right-3 top-9">
                {isCheckingDiscord ? (
                  <svg className="w-4 h-4 animate-spin text-fur-cream/50" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : discordAvailable === true ? (
                  <svg className="w-4 h-4 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : discordAvailable === false ? (
                  <svg className="w-4 h-4 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            )}
          </div>

          {/* Preferred Contact */}
          <div>
            <label className="block text-sm font-medium text-fur-cream mb-2">
              Preferred Contact Method
              <span className="text-accent-red font-normal ml-1">*</span>
            </label>
            <p className="text-xs text-fur-cream/40 mb-3">
              How should admins contact you if needed? This is required.
            </p>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="telegram"
                  {...register('preferredContact')}
                  className="sr-only peer"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark-500 bg-dark-800 peer-checked:border-brand-200 peer-checked:bg-brand-200/10 hover:border-dark-400 transition-all">
                  <svg className="w-4 h-4 text-fur-cream/70 peer-checked:text-brand-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span className="text-sm font-medium text-fur-cream">Telegram</span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  value="discord"
                  {...register('preferredContact')}
                  className="sr-only peer"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark-500 bg-dark-800 peer-checked:border-brand-200 peer-checked:bg-brand-200/10 hover:border-dark-400 transition-all">
                  <svg className="w-4 h-4 text-fur-cream/70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span className="text-sm font-medium text-fur-cream">Discord</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending || isCheckingUniqueness}
            disabled={!isDirty || !isValid || isPending || hasUniquenessError || isCheckingUniqueness}
          >
            {isCheckingUniqueness ? 'Checking...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;
