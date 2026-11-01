import { PracticeView } from "@/components/features/practice";

/**
 * Home page — renders the phoneme practice tool.
 *
 * This is a Server Component that delegates all interactivity
 * to the PracticeView client component.
 */
export default function HomePage() {
  return <PracticeView />;
}

