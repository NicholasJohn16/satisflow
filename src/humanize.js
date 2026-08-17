const suffixes = ['', 'k', 'm', 'b', 't'];

const getMaximumFractionDigits = (value) => {
    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 100) return 0;
    if (absoluteValue >= 10) return 1;
    return 2;
};

const format = (value) => value.toLocaleString(undefined, {
    maximumFractionDigits: getMaximumFractionDigits(value),
});

const humanize = (value) => {
    if (!Number.isFinite(value)) return String(value);

    const absoluteValue = Math.abs(value);
    if (absoluteValue < 1000) return format(value);

    let suffixIndex = Math.min(
        Math.floor(Math.log10(absoluteValue) / 3),
        suffixes.length - 1,
    );
    let scaledValue = value / (1000 ** suffixIndex);
    const roundedValue = Number(scaledValue.toFixed(
        getMaximumFractionDigits(scaledValue),
    ));

    if (Math.abs(roundedValue) >= 1000 && suffixIndex < suffixes.length - 1) {
        suffixIndex += 1;
        scaledValue /= 1000;
    }

    return `${format(scaledValue)}${suffixes[suffixIndex]}`;
};

export { humanize };
