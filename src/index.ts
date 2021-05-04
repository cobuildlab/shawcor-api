const quotes = ['test1', 'test2'];
/**
 * Return String of the array.
 *
 * @returns String.
 * @example example
 */
function randomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

module.exports = {
  randomQuote,
};
