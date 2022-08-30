interface IAdvice<T extends (...args: any[]) => any> {
    selector: RegExp,
    advice: T;
}


function weave<T extends (...args: any[]) => any, O extends any>(aspect: IAdvice<T>, object: O): O {
    Reflect
        .ownKeys(object)
        .filter(key => aspect.selector.test(key))
        .forEach(key => {
            object[key] = aspect.advice(object[key]);
        });

    return object;
}

function Weave(...advices: IAdvice[]): ClassDecorator {
    return function (target: any) {
        return class extends target {
            constructor(...args) {
                super(...args);
                let proto = Reflect.getPrototypeOf(Reflect.getPrototypeOf(this));
                advices.forEach(advice => weave(advice, proto));
            }
        }
    }
}

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


// Client code
@Weave(logAdviceObject, cacheAdviceObject)
class Obj {
    context = 10;

    fn(a: number, b: string): number {
        return a + parseInt(b, 10) + this.context;
    }
};

const obj = new Obj();
obj.fn(1, "5");
obj.fn(1, "5");

// ORDER MEANS!
// const obj_cache = weave(cacheAdviceObject, obj);
// const obj_cache_log = weave(logAdviceObject, obj_cache);
// obj_cache_log.fn(1, "4");
// obj_cache_log.fn(1, "4");