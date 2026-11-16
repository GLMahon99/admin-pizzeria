import { useSyncExternalStore } from 'react';

// Mismo corte que el breakpoint `md` de Tailwind: por debajo de 768px es "celular".
// En celular el admin funciona en modo reducido (solo consulta y operación rápida).
const QUERY = '(max-width: 767px)';

const subscribe = (callback) => {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

const useIsMobile = () => useSyncExternalStore(subscribe, getSnapshot, () => false);

export default useIsMobile;
