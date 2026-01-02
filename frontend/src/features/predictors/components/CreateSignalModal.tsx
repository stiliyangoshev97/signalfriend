/**
 * @fileoverview Create Signal Modal Component
 * @module features/predictors/components/CreateSignalModal
 * @description
 * Modal form for predictors to create new prediction signals.
 * Includes validation, two-step category selection, confidence level, and date picker.
 */

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button, Input, Textarea, Select, Spinner } from '@/shared/components/ui';
import { createSignalSchema, type CreateSignalData } from '@/shared/schemas/signal.schemas';
import { useCategories } from '@/features/signals/hooks';
import { useCreateSignal } from '../hooks';

/** Props for CreateSignalModal component */
interface CreateSignalModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback after successful signal creation */
  onSuccess?: () => void;
}

/**
 * CreateSignalModal component
 * 
 * Full-featured form modal for creating a new prediction signal with:
 * - Title and description fields
 * - Protected signal content (only visible after purchase)
 * - Category selection (two-step: main group → subcategory)
 * - Price in USDT (minimum $1)
 * - Expiration date picker (1-90 days)
 * - Confidence level slider (1-100%)
 * - Optional event URL for prediction market links
 * - Form validation with Zod
 * - Loading states and error handling
 */
export function CreateSignalModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSignalModalProps): React.ReactElement {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedMainGroup, setSelectedMainGroup] = useState<string>('');
  
  // Fetch categories for dropdown
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  // Create signal mutation
  const { mutate: createSignal, isPending: isCreating } = useCreateSignal();

  // Define main group order for prediction markets
  const MAIN_GROUP_ORDER = ['Crypto', 'Finance', 'Politics', 'Sports', 'World', 'Culture'];

  // Group categories by mainGroup
  const categoryGroups = useMemo(() => {
    if (!categories) return { mainGroups: [], subcategoriesByGroup: {} };
    
    const subcategoriesByGroup: Record<string, typeof categories> = {};
    const mainGroupsSet = new Set<string>();
    
    for (const cat of categories) {
      if (cat.mainGroup) {
        mainGroupsSet.add(cat.mainGroup);
        if (!subcategoriesByGroup[cat.mainGroup]) {
          subcategoriesByGroup[cat.mainGroup] = [];
        }
        subcategoriesByGroup[cat.mainGroup].push(cat);
      }
    }
    
    // Sort main groups according to predefined order
    const sortedMainGroups = Array.from(mainGroupsSet).sort((a, b) => {
      const indexA = MAIN_GROUP_ORDER.indexOf(a);
      const indexB = MAIN_GROUP_ORDER.indexOf(b);
      const orderA = indexA === -1 ? MAIN_GROUP_ORDER.length : indexA;
      const orderB = indexB === -1 ? MAIN_GROUP_ORDER.length : indexB;
      return orderA - orderB;
    });
    
    return {
      mainGroups: sortedMainGroups,
      subcategoriesByGroup,
    };
  }, [categories]);

  // Get subcategories for selected main group
  const subcategories = selectedMainGroup 
    ? categoryGroups.subcategoriesByGroup[selectedMainGroup] || []
    : [];

  // Calculate min/max dates for the date picker
  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  const defaultExpiry = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days default
  
  // Format date for input
  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];
  
  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateSignalData>({
    resolver: zodResolver(createSignalSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      content: '',
      categoryId: '',
      priceUsdt: 5,
      expiresAt: defaultExpiry.toISOString(),
      confidenceLevel: 70,
      eventUrl: '',
    },
  });
  
  // Watch values for character counts and display
  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';
  const contentValue = watch('content') || '';
  const priceValue = watch('priceUsdt');
  const confidenceValue = watch('confidenceLevel') || 70;
  const eventUrlValue = watch('eventUrl') || '';
  
  // Calculate total buyer cost (price + $0.5 access fee)
  const buyerCost = (priceValue || 0) + 0.5;
  // Calculate predictor earnings (95% of price, platform takes 5%)
  const predictorEarnings = ((priceValue || 0) * 0.95).toFixed(2);

  // Get confidence level color
  const getConfidenceColor = (level: number) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-yellow-400';
    if (level >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Extract domain from URL
  const getUrlDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return null;
    }
  };
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSubmitError(null);
      setSelectedMainGroup('');
    }
  }, [isOpen, reset]);
  
  // Handle form submission
  const onSubmit = (data: CreateSignalData) => {
    setSubmitError(null);
    
    // Convert date string to ISO format for backend
    const formData = {
      ...data,
      expiresAt: new Date(data.expiresAt).toISOString(),
      eventUrl: data.eventUrl || undefined, // Don't send empty string
    };
    
    createSignal(formData, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
      onError: (error: Error) => {
        setSubmitError(error.message || 'Failed to create signal. Please try again.');
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Signal"
      size="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <Input
            label="Signal Title"
            placeholder="e.g., Will BTC reach $150k by 2027?"
            {...register('title')}
            error={errors.title?.message}
          />
          <div className="flex justify-between mt-1 text-xs text-fur-cream/50">
            <span>A clear prediction question or statement</span>
            <span className={titleValue.length > 100 ? 'text-error-400' : ''}>
              {titleValue.length}/100
            </span>
          </div>
        </div>

        {/* Description (Teaser) */}
        <div>
          <Textarea
            label="Description (Teaser)"
            placeholder="A brief preview of what this signal covers. This is visible BEFORE purchase."
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />
          <div className="flex justify-between mt-1 text-xs text-fur-cream/50">
            <span>Visible publicly - hook potential buyers</span>
            <span className={descriptionValue.length > 1000 ? 'text-error-400' : ''}>
              {descriptionValue.length}/1000
            </span>
          </div>
        </div>

        {/* Protected Content */}
        <div>
          <Textarea
            label="Signal Content (Protected)"
            placeholder="Your full analysis, prediction outcome, reasoning, and insights. This is ONLY visible after purchase."
            rows={8}
            {...register('content')}
            error={errors.content?.message}
          />
          <div className="flex justify-between mt-1 text-xs text-fur-cream/50">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protected - only buyers can see this
            </span>
            <span className={contentValue.length > 3000 ? 'text-error-400' : ''}>
              {contentValue.length}/3000
            </span>
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Group (Step 1) */}
          <div>
            {categoriesLoading ? (
              <div className="h-10 bg-dark-700 rounded-lg flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : (
              <Select
                label="Category Group"
                placeholder="Select a category group"
                value={selectedMainGroup}
                onChange={(e) => {
                  setSelectedMainGroup(e.target.value);
                  setValue('categoryId', '', { shouldValidate: true });
                }}
                options={categoryGroups.mainGroups.map((group) => ({
                  value: group,
                  label: group,
                }))}
              />
            )}
            <div className="mt-1 text-xs text-fur-cream/50">
              First, choose the main category
            </div>
          </div>

          {/* Subcategory (Step 2) */}
          <div>
            <Select
              label="Subcategory"
              placeholder={selectedMainGroup ? "Select a subcategory" : "Select a group first"}
              disabled={!selectedMainGroup}
              options={subcategories.map((category) => ({
                value: category._id,
                label: category.name,
              }))}
              {...register('categoryId')}
              error={errors.categoryId?.message}
            />
            <div className="mt-1 text-xs text-fur-cream/50">
              Then, select the specific subcategory
            </div>
          </div>
        </div>

        {/* Event URL (Optional) */}
        <div>
          <Input
            label="Prediction Market URL (Optional)"
            placeholder="e.g., https://polymarket.com/event/..."
            {...register('eventUrl')}
            error={errors.eventUrl?.message}
          />
          <div className="flex justify-between mt-1 text-xs text-fur-cream/50">
            <span>Link to the prediction market event (Polymarket, Predict.fun, etc.)</span>
            {eventUrlValue && getUrlDomain(eventUrlValue) && (
              <span className="text-brand-400">
                📎 {getUrlDomain(eventUrlValue)}
              </span>
            )}
          </div>
        </div>

        {/* Price & Expiration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <Input
              type="text"
              inputMode="decimal"
              label="Price (USDT)"
              placeholder="5.00"
              onKeyDown={(e) => {
                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                const isNumber = /^[0-9]$/.test(e.key);
                const isPeriod = e.key === '.';
                const isAllowedKey = allowedKeys.includes(e.key);
                const isSelectAll = (e.ctrlKey || e.metaKey) && e.key === 'a';
                const isCopy = (e.ctrlKey || e.metaKey) && e.key === 'c';
                const isPaste = (e.ctrlKey || e.metaKey) && e.key === 'v';
                const isCut = (e.ctrlKey || e.metaKey) && e.key === 'x';
                
                if (e.key === ',') {
                  e.preventDefault();
                  return;
                }
                
                if (!isNumber && !isPeriod && !isAllowedKey && !isSelectAll && !isCopy && !isPaste && !isCut) {
                  e.preventDefault();
                  return;
                }
                
                if (isPeriod && (e.target as HTMLInputElement).value.includes('.')) {
                  e.preventDefault();
                }
              }}
              {...register('priceUsdt', {
                setValueAs: (v) => {
                  if (v === '' || v === undefined || v === null) return undefined;
                  const num = parseFloat(v);
                  return isNaN(num) ? undefined : num;
                },
              })}
              error={errors.priceUsdt?.message}
            />
            <div className="mt-1 text-xs text-fur-cream/50">
              Minimum $1 USDT
            </div>
          </div>

          {/* Expiration Date Picker */}
          <div>
            <label className="block text-sm font-medium text-fur-cream mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              min={formatDateForInput(minDate)}
              max={formatDateForInput(maxDate)}
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-fur-cream focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              {...register('expiresAt')}
            />
            {errors.expiresAt && (
              <p className="mt-1 text-xs text-error-400">{errors.expiresAt.message}</p>
            )}
            <div className="mt-1 text-xs text-fur-cream/50">
              Signal can be purchased until this date (1-90 days)
            </div>
          </div>
        </div>

        {/* Confidence Level Slider */}
        <div>
          <label className="block text-sm font-medium text-fur-cream mb-2">
            Confidence Level
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={100}
              {...register('confidenceLevel', { valueAsNumber: true })}
              className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <span className={`text-lg font-semibold min-w-[60px] text-right ${getConfidenceColor(confidenceValue)}`}>
              {confidenceValue}%
            </span>
          </div>
          <div className="mt-1 text-xs text-fur-cream/50">
            How confident are you in this prediction?
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-dark-700 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-fur-cream mb-3">Price Breakdown</h4>
          <div className="flex justify-between text-sm">
            <span className="text-fur-cream/60">Your signal price</span>
            <span className="text-fur-cream">${(priceValue || 0).toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fur-cream/60">Platform access fee</span>
            <span className="text-fur-cream">+ $0.50 USDT</span>
          </div>
          <div className="border-t border-dark-600 my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-fur-cream/60">Buyer pays</span>
            <span className="text-fur-light font-semibold">${buyerCost.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fur-cream/60">Platform commission (5%)</span>
            <span className="text-fur-cream/60">- ${((priceValue || 0) * 0.05).toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-fur-cream font-medium">You receive per sale</span>
            <span className="text-success-400 font-semibold">${predictorEarnings} USDT</span>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="bg-error-500/10 border border-error-500/30 rounded-lg p-3">
            {submitError.split('\n').map((line, idx) => (
              <p key={idx} className="text-sm text-error-400">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!isValid || isCreating}
            isLoading={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Signal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
