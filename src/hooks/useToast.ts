'use client';

import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, []);

  return { toast, showToast };
}
