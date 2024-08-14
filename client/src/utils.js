/**
 * Formatter for currency values.
 * 
 * This formatter is configured to format numbers as currency in Singapore Dollars (SGD). 
 * It includes up to two decimal places and uses the standard currency formatting style.
 * 
 * @type {Intl.NumberFormat}
 * @example
 * // Usage example
 * const amount = 123.45;
 * const formattedAmount = currencyFormatter.format(amount);
 * console.log(formattedAmount); // Outputs: "SGD 123.45"
 */
export const currencyFormatter = new Intl.NumberFormat(undefined, {
    currency: "sgd",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
})