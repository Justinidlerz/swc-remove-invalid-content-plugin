const parsePriceWording = (priceValue)=>{
    const currency = {
        separator: '.',
        decimal_symbol: ','
    };
    const parsedText = priceValue.replace(new RegExp(`\\${(currency === null || currency === void 0 ? void 0 : currency.separator) || ''}`, 'g'), '').replace(new RegExp(`\\${(currency === null || currency === void 0 ? void 0 : currency.decimal_symbol) || '.'}`, 'g'), '.');
    return parsedText;
};
