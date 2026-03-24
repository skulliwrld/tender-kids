import { Suspense } from 'react';
import ParentFeePortal from '@/components/fees/parent/ParentFeePortal';

export default function ParentFeesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ParentFeePortal />
    </Suspense>
  );
}
