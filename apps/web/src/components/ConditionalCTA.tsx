import type { ReactNode } from 'react';

interface Props {
  /** Whether the user is authenticated. */
  authenticated: boolean;
  /** Content to show for authenticated users. */
  authenticatedContent: ReactNode;
  /** Content to show for anonymous users (e.g. "Sign in to save"). */
  anonymousContent: ReactNode;
  /** Optional wrapper class. */
  className?: string;
}

/**
 * Conditional CTA component.
 *
 * Renders different content based on auth state. Common pattern:
 * - Authenticated: "You beat 42% of learners!" (personalized)
 * - Anonymous: "Sign in to save your progress" (conversion nudge)
 *
 * Extracted from AchievementCard's auth-state branching.
 */
export default function ConditionalCTA({ authenticated, authenticatedContent, anonymousContent, className }: Props) {
  return <div className={className}>{authenticated ? authenticatedContent : anonymousContent}</div>;
}
