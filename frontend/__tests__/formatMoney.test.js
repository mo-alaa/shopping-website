import formatMoney from '../lib/formatMoney';

describe('formatMoney', ()=> {
    xit('works with cents', () => {
        expect(formatMoney(1)).toEqual('$0.01');
        expect(formatMoney(10)).toEqual('$0.10');
    });
    xit('works with whole dollars', () => {
        expect(formatMoney(100)).toEqual('$1');
        expect(formatMoney(1000)).toEqual('$10');
        expect(formatMoney(100000)).toEqual('$1,000');
    });
    xit('works with cents and whole dollars', () => {
        expect(formatMoney(101)).toEqual('$1.01');
        expect(formatMoney(1011)).toEqual('$10.11');
    });
});