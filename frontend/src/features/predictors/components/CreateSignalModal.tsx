/**
 * @fileoverview Create Signal Modal Component
 * @module features/predictors/components/CreateSignalModal
 * @description
 * Modal form for predictors to create new signals.
 * Includes validation, two-step category selection, and price input.
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
 * Full-featured form modal for creating a new signal with:
 * - Title and description fields
 * - Protected signal content (only visible after purchase)
 * - Category selection
 * - Price in USDT (minimum $1)
 * - Expiry duration (1-30 days)
 * - Form validation with Zod
 * - Loading states and error handling
 * 
 * @param props - Component props
 * @returns Modal element
 * 
 * @example
 * <CreateSignalModal
 *   isOpen={showCreateModal}
 *   onClose={() => setShowCreateModal(false)}
 *   onSuccess={() => refetchSignals()}
 * />
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

  // Define explicit main group order (Crypto → Traditional Finance → Macro / Other)
  const MAIN_GROUP_ORDER = ['Crypto', 'Traditional Finance', 'Macro / Other'];

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
      // If not in predefined order, put at end
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
      expiryDays: 7,
      riskLevel: 'medium',
      potentialReward: 'medium',
    },
  });
  
  // Watch values for character counts
  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';
  const contentValue = watch('content') || '';
  const priceValue = watch('priceUsdt');
  
  // Calculate total buyer cost (price + $0.5 access fee)
  const buyerCost = (priceValue || 0) + 0.5;
  // Calculate predictor earnings (95% of price, platform takes 5%)
  const predictorEarnings = ((priceValue || 0) * 0.95).toFixed(2);
  
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
    
    createSignal(data, {
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
            placeholder="e.g., BTC Short-Term Breakout Alert"
            {...register('title')}
            error={errors.title?.message}
          />
          <div className="flex justify-between mt-1 text-xs text-fur-cream/50">
            <span>A catchy, descriptive title for your signal</span>
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
            placeholder="Your full analysis, entry/exit points, targets, stop-loss, reasoning, etc. This is ONLY visible after purchase."
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
            <span className={contentValue.length > 10000 ? 'text-error-400' : ''}>
              {contentValue.length}/10000
            </span>
          </div>
        </div>

        {/* Category & Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Two-step Category Selection */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    // Reset subcategory when main group changes
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
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Price */}
          <div>
            <Input
              type="text"
              inputMode="decimal"
              label="Price (USDT)"
              placeholder="5.00"
              onKeyDown={(e) => {
                // Block comma and non-numeric characters except period and control keys
                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                const isNumber = /^[0-9]$/.test(e.key);
                const isPeriod = e.key === '.';
                const isAllowedKey = allowedKeys.includes(e.key);
                const isSelectAll = (e.ctrlKey || e.metaKey) && e.key === 'a';
                const isCopy = (e.ctrlKey || e.metaKey) && e.key === 'c';
                const isPaste = (e.ctrlKey || e.metaKey) && e.key === 'v';
                const isCut = (e.ctrlKey || e.metaKey) && e.key === 'x';
                
                // Block comma - users should use period for decimals
                if (e.key === ',') {
                  e.preventDefault();
                  return;
                }
                
                // Allow only numbers, period (once), and control keys
                if (!isNumber && !isPeriod && !isAllowedKey && !isSelectAll && !isCopy && !isPaste && !isCut) {
                  e.preventDefault();
                  return;
                }
                
                // Only allow one period
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
              Minimum $1 USDT • Use period (.) for decimals, e.g., 10.50
            </div>
          </div>
        </div>

        {/* Expiry Duration */}
        <div>
          <label className="block text-sm font-medium text-fur-cream mb-2">
            Active Duration (Days)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={30}
              {...register('expiryDays', { valueAsNumber: true })}
              className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-fur-light"
            />
            <span className="text-lg font-semibold text-fur-light min-w-[100px] text-right whitespace-nowrap">
              {watch('expiryDays') || 7} days
            </span>
          </div>
          <div className="mt-1 text-xs text-fur-cream/50">
            Signal will be available for purchase for this duration (1-30 days)
          </div>
        </div>

        {/* Risk Level & Potential Reward */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-fur-cream mb-2">
              Risk Level
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <label
                  key={level}
                  className={`flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    watch('riskLevel') === level
                      ? level === 'low'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : level === 'medium'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                        : 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-dark-700 border-dark-600 text-fur-cream/70 hover:border-dark-500'
                  }`}
                >
                  <input
                    type="radio"
                    value={level}
                    {...register('riskLevel')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">{level}</span>
                </label>
              ))}
            </div>
            <div className="mt-1 text-xs text-fur-cream/50">
              Your assessment of the risk involved
            </div>
          </div>

          {/* Potential Reward */}
          <div>
            <label className="block text-sm font-medium text-fur-cream mb-2">
              Potential Reward
            </label>
            <div className="flex gap-2">
              {(['normal', 'medium', 'high'] as const).map((reward) => (
                <label
                  key={reward}
                  className={`flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    watch('potentialReward') === reward
                      ? reward === 'normal'
                        ? 'bg-fur-cream/10 border-fur-cream/50 text-fur-cream'
                        : reward === 'medium'
                        ? 'bg-fur-light/20 border-fur-light text-fur-light'
                        : 'bg-fur-main/20 border-fur-main text-fur-main'
                      : 'bg-dark-700 border-dark-600 text-fur-cream/70 hover:border-dark-500'
                  }`}
                >
                  <input
                    type="radio"
                    value={reward}
                    {...register('potentialReward')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">{reward}</span>
                </label>
              ))}
            </div>
            <div className="mt-1 text-xs text-fur-cream/50">
              Expected return potential
            </div>
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
            <p className="text-sm text-error-400">{submitError}</p>
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
