function sum(a: number, b: number): number {
    return a + b;
}
export default sum;


export function forEach(items: any, callback: Function): void {
    for (const item of items) {
        callback(item);
    }
}