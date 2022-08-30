interface IAdvice<T extends (...args: any[]) => any> {
    selector: RegExp,
    advice: T;
}

const obj = {
    context: 10,
    fn(a: number, b: string): number {
        return a + parseInt(b, 10) + this.context;
    }
};

// реализация связывания - декорирование по конфигу
function weave<T extends (...args: any[]) => any, O extends any>(aspect: IAdvice<T>, object: O): O {
    Object
        .entries(object)
        .filter(entry => aspect.selector.test(entry[0]))
        .forEach(entry => {
            object[entry[0]] = aspect.advice(object[entry[0]]);
        });

    return object;
}

// логирующий аспект
const logAdviceObject = {
    selector: /^fn$/,
    advice<T extends (...args: any[]) => any>(fn: T): (this: ThisType<T>, ...args: Parameters<T>) => ReturnType<T> {
        return function (...args) {
            const result = fn.apply(this, args);
            console.log(fn.name, " {", this, "} ", " :: ", args, " => ", result);
            return result;
        }
    }
};

// кэширующий аспект
const cacheAdviceObject = {
    selector: /^fn$/,
    advice<T extends (...args: any[]) => any>(fn: T): (this: ThisType<T>, ...args: Parameters<T>) => ReturnType<T> {
        const cache = new Map<string, ReturnType<T>>();

        return function (...args) {
            const cacheKey = JSON.stringify(args);
            let result;
            if (cache.has(cacheKey)) {
                result = cache.get(cacheKey);
                console.log(result, "Return from cache.");
            } else {
                result = fn.apply(this, args);
                cache.set(cacheKey, result);
            }

            return result;
        }
    }
};

const obj_log = weave(logAdviceObject, obj);
const obj_log_cache = weave(cacheAdviceObject, obj_log);
obj_log_cache.fn(1, "4");
obj_log_cache.fn(1, "4");


// ORDER MEANS!
// const obj_cache = weave(cacheAdviceObject, obj);
// const obj_cache_log = weave(logAdviceObject, obj_cache);
// obj_cache_log.fn(1, "4");
// obj_cache_log.fn(1, "4");
