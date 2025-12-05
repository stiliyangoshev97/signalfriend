/**
 * UI Components Barrel Export
 *
 * Central export point for all shared UI components.
 * Import components from this file for cleaner imports throughout the app.
 *
 * @module shared/components/ui
 *
 * USAGE:
 * ```tsx
 * // Import multiple components
 * import { Button, Input, Card, Modal } from '@/shared/components/ui';
 *
 * // Or import individually
 * import { Button } from '@/shared/components/ui';
 * ```
 *
 * AVAILABLE COMPONENTS:
 * - Button       - Primary action component with variants
 * - Input        - Form text input with label/error support
 * - Card         - Container component (Card, CardHeader, CardTitle, etc.)
 * - Modal        - Dialog overlay component (Modal, ModalFooter)
 * - Badge        - Status/label indicator
 * - Select       - Dropdown selection input
 * - Textarea     - Multi-line text input
 * - Spinner      - Loading indicator (Spinner, PageLoader)
 * - Avatar       - User avatar with fallback
 */

// UI Components barrel export
export { Button } from './Button';
export { Input } from './Input';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { Modal, ModalFooter } from './Modal';
export { Badge } from './Badge';
export { Select } from './Select';
export { Textarea } from './Textarea';
export { Spinner, PageLoader } from './Spinner';
export { Avatar } from './Avatar';
export { StarRating } from './StarRating';
