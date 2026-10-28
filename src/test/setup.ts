import '@testing-library/jest-dom/vitest';

// jsdom não implementa window.scrollTo (usado ao trocar de tela em App.tsx).
window.scrollTo = (() => {}) as typeof window.scrollTo;
