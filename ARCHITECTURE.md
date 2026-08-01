export const formatEuro = (cents: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export const formatNumber = (value: number) => new Intl.NumberFormat('de-DE').format(value);
