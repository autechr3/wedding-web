import '@testing-library/jest-dom';

// jsdom does not implement scrollTo; stub it so the gate's scroll-to-top on
// unlock doesn't emit "Not implemented" noise during tests.
window.scrollTo = () => {};
