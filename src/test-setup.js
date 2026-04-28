import '@testing-library/jest-dom';

// Radix UI + react-day-picker rely on these DOM APIs that jsdom does not
// implement. Stub them so dropdown tests can open / close their portals.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
