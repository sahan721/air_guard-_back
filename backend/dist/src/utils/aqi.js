export function calculateAQI(pm25) {
    const breakpoints = [
        { cl: 0.0, ch: 12.0, il: 0, ih: 50 },
        { cl: 12.1, ch: 35.4, il: 51, ih: 100 },
        { cl: 35.5, ch: 55.4, il: 101, ih: 150 },
        { cl: 55.5, ch: 150.4, il: 151, ih: 200 },
        { cl: 150.5, ch: 250.4, il: 201, ih: 300 },
        { cl: 250.5, ch: 350.4, il: 301, ih: 400 },
        { cl: 350.5, ch: 500.4, il: 401, ih: 500 },
    ];
    for (const bp of breakpoints) {
        if (pm25 >= bp.cl && pm25 <= bp.ch) {
            return Math.round(((bp.ih - bp.il) * (pm25 - bp.cl)) /
                (bp.ch - bp.cl) +
                bp.il);
        }
    }
    return 500;
}
//# sourceMappingURL=aqi.js.map