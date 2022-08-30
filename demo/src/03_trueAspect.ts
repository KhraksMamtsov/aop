import { afterMethod, beforeMethod, aroundMethod, Advised, Metadata } from "aspect.js";

class LogAspect {
    @afterMethod({
        classNamePattern: /^Obj$/,
        methodNamePattern: /^fn/
    })
    static logAdvice(meta: Metadata, ...args: any) {
        console.log(meta.method.name, " {", meta.method.context, "} ", " :: ", args, " => ", meta.method.result);
    }
}

class CacheAspect {
    static cache = new Map<string, any>();

    @beforeMethod({
        classNamePattern: /^Obj$/,
        methodNamePattern: /^fn/
    })
    static cacheAdvice(meta: Metadata, ...args: any[]) {
        const cacheKey = JSON.stringify(args);
        let result;

        meta.method.proceed = false;

        if (CacheAspect.cache.has(cacheKey)) {
            result = CacheAspect.cache.get(cacheKey);
            console.log(result, "Return from cache.");
        } else {
            result = meta.method.invoke(...meta.method.args);
            CacheAspect.cache.set(cacheKey, result);
        }

        meta.method.result = result;
    }
}

@Advised()
class Obj {
    context: number = 10;

    fn(a: number, b: string): number {
        // console.log("RUN FIRST TIME", "this", this);
        return a + parseInt(b, 10) + this.context;
    }
};

const obj = new Obj();

obj.fn(1, "2");
obj.fn(1, "2");