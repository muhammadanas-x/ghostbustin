import * as React from 'react';
import gsap from 'gsap';

export const useScopedGsapContext = (scope) => {
  const ctx = React.useMemo(() => gsap.context(() => {}, scope), [scope]);
  return ctx;
}

export const useGsapContext = () => {
  const ctx = React.useMemo(() => gsap.context(() => {}), []);
  return ctx;
}
