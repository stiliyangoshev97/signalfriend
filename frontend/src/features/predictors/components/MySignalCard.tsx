/**
 * @fileoverview Predictor's own signal card component
 * @module features/predictors/components/MySignalCard
 * @description
 * Card component for displaying signals in the predictor dashboard.
 * Includes management actions (view, edit, deactivate).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/shared/components/ui';
import type { Signal } from '@/shared/types';
import { formatDistanceToNow, parseISO, isValid, format } from 'date-fns';

/** Props for MySignalCard component */
interface MySignalCardProps {
  /** The signal to display */
  signal: Signal;
  /** Callback when deactivate is clicked */
  onDeactivate?: (contentId: string, title?: string) => void;
  /** Callback when reactivate is clicked */
  onReactivate?: (contentId: string) => void;
  /** Whether an action is in progress */
  isActionPending?: boolean;
}

/**
 * Get expiry status and display text
 */
function getExpiryStatus(expiresAt: string): { 
  isExpired: boolean; 
  text: string; 
  urgency: 'ok' | 'warning' | 'expired' 
} {
  try {
    const date = parseISO(expiresAt);
    if (!isValid(date)) {
      return { isExpired: false, text: 'Unknown', urgency: 'ok' };
    }
    
    const now = new Date();
    const isExpired = date < now;
    
    if (isExpired) {
      return { isExpired: true, text: 'Expired', urgency: 'expired' };
    }
    
    // Check if expiring soon (within 3 days)
    const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 3) {
      return { 
        isExpired: false, 
        text: `Expires ${formatDistanceToNow(date, { addSuffix: true })}`, 
        urgency: 'warning' 
      };
    }
    
    return { 
      isExpired: false, 
      text: `Expires ${format(date, 'MMM d, yyyy')}`, 
      urgency: 'ok' 
    };
  } catch {
    return { isExpired: false, text: 'Unknown', urgency: 'ok' };
  }
}

/**
 * Format creation date
 */
function getCreatedText(createdAt: string): string {
  try {
    const date = parseISO(createdAt);
    if (!isValid(date)) return 'Unknown date';
    return `Created ${formatDistanceToNow(date, { addSuffix: true })}`;
  } catch {
    return 'Unknown date';
  }
}

/**
 * Extract domain from URL for badge display
 */
function getUrlDomain(url: string): string | null {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

/**
 * MySignalCard component
 * 
 * Displays a signal card with:
 * - Title and description
 * - Status badges (active/inactive, expired)
 * - Stats (sales, rating, earnings estimate)
 * - Expiry information
 * - Action buttons (view, deactivate/reactivate)
 * 
 * @param props - Component props
 * @returns Signal card element
 * 
 * @example
 * <MySignalCard
 *   signal={signalData}
 *   onDeactivate={(id) => handleDeactivate(id)}
 * />
 */
export function MySignalCard({
  signal,
  onDeactivate,
  onReactivate,
  isActionPending,
}: MySignalCardProps): React.ReactElement {
  const [showActions, setShowActions] = useState(false);
  
  const expiry = getExpiryStatus(signal.expiresAt);
  const isActive = signal.isActive !== false && !expiry.isExpired;
  const createdText = getCreatedText(signal.createdAt);
  
  // Estimate earnings (95% of price * sales, since platform takes 5%)
  const estimatedEarnings = (signal.priceUsdt * 0.95 * signal.totalSales).toFixed(2);

  return (
    <Card 
      padding="none" 
      className="relative overflow-hidden group h-full"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Status indicator bar */}
      <div className={`h-1 ${isActive ? 'bg-success-500' : 'bg-gray-600'}`} />
      
      <div className="p-5 flex flex-col h-full">
        {/* Variable content area - grows to fill space */}
        <div className="flex-grow">
          {/* Header: Status badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {isActive ? (
              <Badge variant="success">Active</Badge>
            ) : expiry.isExpired ? (
              <Badge variant="error">Expired</Badge>
            ) : (
              <Badge variant="default">Inactive</Badge>
            )}
            {!expiry.isExpired && expiry.urgency === 'warning' && (
              <Badge variant="warning">{expiry.text}</Badge>
            )}
            {signal.eventUrl && getUrlDomain(signal.eventUrl) && (
              <span className="text-xs font-medium px-2 py-0.5 rounded border flex items-center gap-1 bg-green-500/20 text-green-400 border-green-500/30 min-w-0 max-w-[140px]">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="truncate">{getUrlDomain(signal.eventUrl)}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <Link 
            to={`/signals/${signal.contentId}`}
            className="block group/title"
          >
            <h3 className="text-lg font-semibold text-fur-cream mb-2 line-clamp-2 group-hover/title:text-fur-light transition-colors">
              {signal.title || 'Untitled Signal'}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-fur-cream/60 mb-4 line-clamp-2">
            {signal.description || 'No description'}
          </p>
        </div>

        {/* Fixed content area - always at bottom */}
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Price */}
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <p className="text-xs text-fur-cream/50 mb-1">Price</p>
            <p className="text-lg font-bold text-fur-light">${signal.priceUsdt}</p>
          </div>
          
          {/* Sales */}
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <p className="text-xs text-fur-cream/50 mb-1">Sales</p>
            <p className="text-lg font-bold text-success-400">{signal.totalSales}</p>
          </div>
          
          {/* Earnings */}
          <div className="bg-dark-700 rounded-lg p-3 text-center">
            <p className="text-xs text-fur-cream/50 mb-1">Earnings</p>
            <p className="text-lg font-bold text-brand-400">${estimatedEarnings}</p>
          </div>
        </div>

        {/* Rating & Meta */}
        <div className="flex items-center justify-between text-xs text-fur-cream/50 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-fur-light" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>
              {signal.averageRating.toFixed(1)} ({signal.totalReviews} reviews)
            </span>
          </div>
          <span>{createdText}</span>
        </div>

        {/* Expiry info */}
        {!expiry.isExpired && expiry.urgency === 'ok' && (
          <div className="flex items-center gap-1 text-xs text-fur-cream/50 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{expiry.text}</span>
          </div>
        )}

        {/* Category path (e.g., "Crypto > Bitcoin") - positioned at bottom left */}
        {signal.category && (
          <div className="flex items-center gap-1 text-xs text-fur-cream/50 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>
              {signal.category.mainGroup || signal.mainGroup} &gt; {signal.category.name}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className={`flex gap-2 transition-opacity duration-200 ${showActions || window.innerWidth < 768 ? 'opacity-100' : 'opacity-0'}`}>
          <Link
            to={`/signals/${signal.contentId}`}
            className="flex-1"
          >
            <Button variant="secondary" size="sm" className="w-full">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </Button>
          </Link>
          
          {isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeactivate?.(signal.contentId, signal.title)}
              disabled={isActionPending}
              className="text-error-400 hover:text-error-300 hover:bg-error-500/10"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Deactivate
            </Button>
          ) : !expiry.isExpired && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReactivate?.(signal.contentId)}
              disabled={isActionPending}
              className="text-success-400 hover:text-success-300 hover:bg-success-500/10"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reactivate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
