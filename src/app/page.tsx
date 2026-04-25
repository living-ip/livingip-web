import { ClaimRotation } from "@/components/claim-rotation";
import { ROTATION, pickFocalIndex } from "@/lib/rotation";

// Re-evaluate the focal claim periodically — pickFocalIndex is date-driven,
// so without revalidate the static prerender would freeze on whatever date
// the build ran. 5 min is short enough that the focal flips within minutes
// of UTC midnight on any sustained traffic.
export const revalidate = 300;

export default function HomePage() {
  const initialIndex = pickFocalIndex();
  return <ClaimRotation rotation={ROTATION} initialIndex={initialIndex} />;
}
