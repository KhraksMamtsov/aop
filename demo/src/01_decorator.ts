export function log<T extends (...args: any[]) => any>(fn: T): (this: ThisType<T>, ...args: Parameters<T>) => ReturnType<T> {
    return function (...args) {
        const result = fn.apply(this, args);
        console.log(fn.name, " {", this, "} ", " :: ", args, " => ", result);
        return result;
    }
}

const someObject = {
    context: 10,
    fn: /* add log */log(function fn(a: number, b: string): number {
        return a + parseInt(b, 10) + this.context;
    })
};

someObject.fn(1, "2");