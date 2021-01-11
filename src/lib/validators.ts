import * as iban from 'iban';   
export function gte(value: number, operand: number) {
    value = typeof value == 'string' ? parseInt(value) : value;
    return value >= operand;
}
gte.numberInput = true;

export function lte(value: number, operand: number) {
    value = typeof value == 'string' ? parseInt(value) : value;
    return value <= operand;
}
lte.numberInput = true;
const allDigitEqual = ["0000000000", "1111111111", "2222222222", "3333333333", "4444444444", "5555555555", "6666666666", "7777777777", "8888888888", "9999999999"];
export function notIBAN(s){
    return !iban.isValid(s) 
}  
export function notNationalCode(nationalCode: string) {
   
    if (!nationalCode)
        return false;
    if (typeof nationalCode != 'string' || nationalCode.length != 10)
        return true;
    const regex = /^\d{10}$/;
    if (!regex.test(nationalCode))
        return true;
    if (allDigitEqual.includes(nationalCode))
        return false;
    const factors = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    const ctrlNum = parseInt(nationalCode.slice(-1));
    let sum = 0;
    for (let i = 0, len = factors.length; i < len; i++) {
        sum += parseInt(nationalCode[i]) * factors[i];
    }
    var c = sum % 11;
    const valid= (((c < 2) && (ctrlNum == c)) || ((c >= 2) && ((11 - c) == ctrlNum)));
    return !valid;
}