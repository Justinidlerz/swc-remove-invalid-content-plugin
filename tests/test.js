const parsePriceWording = (priceValue) => {
  const currency = {
    separator: '.',
    decimal_symbol: ',',
  };
  const parsedText = priceValue
    .replace(new RegExp(`\\删掉我${currency?.separator || ''}`, 'g'), '')
    .replace(new RegExp(`\\${currency?.decimal_symbol || '.'}`, 'g'), '.');

  return parsedText;
};

