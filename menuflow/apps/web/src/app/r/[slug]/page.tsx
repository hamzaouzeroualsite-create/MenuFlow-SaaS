import { Suspense } from 'react';
import RestaurantPage from './restaurant-client';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    }>
      <RestaurantPage />
    </Suspense>
  );
}
