var parsePriceWording = function(priceValue) {
    var currency = {
        separator: '.',
        decimal_symbol: ','
    };
    var parsedText = priceValue.replace(new RegExp("\\\\".concat((currency === null || currency === void 0 ? void 0 : currency.separator) || ''), 'g'), '').replace(new RegExp("\\".concat((currency === null || currency === void 0 ? void 0 : currency.decimal_symbol) || '.'), 'g'), '.');
    return parsedText;
};
