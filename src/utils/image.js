/**
 * Placeholder utilities for future image processing operations.
 */

/**
 * Returns true if the file extension is a supported image type.
 * @param {string} filename
 * @returns {boolean}
 */
export function isSupportedImage(filename) {
  return /\.(png|jpg|jpeg|webp)$/i.test(filename);
}

/**
 * Clamps a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
