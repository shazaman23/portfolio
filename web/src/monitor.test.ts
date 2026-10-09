import { describe, expect, it } from 'vitest';
import { monitorSize } from './monitor';

// Expected values come from handleResize() in the Laravel site's
// resources/js/app.js (removed with Laravel in 3.0.0; see git history).
describe('monitorSize', () => {
  it.each([1280, 769])(
    'is the full 632 x 422 screen above 768 px (%i)',
    (w) => {
      expect(monitorSize(w)).toEqual({
        width: 632,
        height: 422,
        marginBottom: 0,
      });
    },
  );

  it.each([
    // [window width, divisor for width, divisor for height]
    [768, 1.25, 1.48],
    [626, 1.25, 1.48],
    [625, 1.28, 1.46],
    [546, 1.28, 1.46],
    [545, 1.31, 1.46],
    [451, 1.31, 1.46],
    [450, 1.36, 1.45],
    [401, 1.36, 1.45],
    [400, 1.4, 1.46],
    [375, 1.4, 1.46],
    [351, 1.4, 1.46],
    [350, 1.46, 1.46],
    [320, 1.46, 1.46],
  ])('scales with the window at %i px', (w, widthDivisor, heightDivisor) => {
    const size = monitorSize(w);
    expect(size.width).toBeCloseTo(w / widthDivisor, 6);
    expect(size.height).toBeCloseTo(w / widthDivisor / heightDivisor, 6);
  });

  it('pulls the menu up by the width below 768 px', () => {
    expect(monitorSize(768).marginBottom).toBe(0);
    expect(monitorSize(700).marginBottom).toBe(-68);
    expect(monitorSize(375).marginBottom).toBe(-393);
  });
});
