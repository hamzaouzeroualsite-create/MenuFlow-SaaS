import { Suspense } from 'react';
import MenuPage from './menu-content';

export default function MenuPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    }>
      <MenuPage />
    </Suspense>
  );
}
