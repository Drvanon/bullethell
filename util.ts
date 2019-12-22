export function vector_addition (v1:number[], v2:number[]) {
    if (v1.length != v2.length) { throw "Vectors not of same length"; };
    return v1.map((el, i) => el + v2[i]);
}

export function vector_subtraction(v1:number[], v2:number[]) {
    if (v1.length != v2.length) { throw "Vectors not of same length"; };
    return v1.map((el, i) => el - v2[i]);
}

export function vector_length(vector:number[]) {
    return Math.sqrt(vector.reduce((acc, val) => {return acc + val * val}, 0));
}

export function skalar_multiplication(v1:number[], skalar:number) {
    return v1.map((el) => skalar*el);
}

export function remove_from_array<T>(array:T[], item:T) {
    array.splice(array.indexOf(item) , 1);
}
