'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

function RegisterModalWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  return (
    <div className="min-h-screen bg-slate-900/40 relative">
      <AuthModal
        isOpen={true}
        onClose={() => router.push(redirectUrl)}
        initialTab="register"
        redirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900/40 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterModalWrapper />
    </Suspense>
  );
}
