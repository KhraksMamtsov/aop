import "reflect-metadata";

const DELETE_COMPONENT_REF_META_KEY = Symbol("DELETE_COMPONENT_REF_META_KEY");

export function Ref(name?: string, isRequired: boolean = false): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        console.log(target);
        Reflect.defineMetadata(
            DELETE_COMPONENT_REF_META_KEY,
            {
                isRequired,
                name: name || propertyKey,
            },
            target,
            propertyKey,
        );
    };
}

Ref.metaKey = DELETE_COMPONENT_REF_META_KEY;
