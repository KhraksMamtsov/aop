import {Config} from './Config';
import {EventEmitter} from './EventEmitter';

// import { DCError } from './Error';

export enum LifeCycleHook {
    BEFORE_MOUNT = 'mount:before',
    AFTER_MOUNT = 'mount:after',
    BEFORE_UNMOUNT = 'unmount:before',
    AFTER_UNMOUNT = 'unmount:after',
    BEFORE_DESTROY = 'destroy:before',
    AFTER_DESTROY = 'destroy:after',
    ERROR = 'error',
}

interface IDOMListenerOptions {
    el: Element;
    event: string;
    options?: useCapture | AddEventListenerOptions;
}

interface IDOMListener extends IDOMListenerOptions {
    handler: EventListener;
}

export type useCapture = boolean;

// /* class decorator */
// function staticImplements<T>() {
//   return (_constructor: T) => {
//   };
// }
//
// interface MyTypeStatic {
//   $name: string;
// }
//
// @staticImplements<MyTypeStatic>()
export class Component extends EventEmitter {
    public static $name: string;
    public $components: {
        [componentAlias: string]: new () => Component;
    } = {};

    // public $parent: Component;
    public $refs: { [key: string]: Element[] } = {};
    public $children: { [key: string]: Component[] } = {};
    public $parent: Component | null = null;

    public $container!: Element;
    public $root!: Component;

    private _config?: Config;
    private DOMListeners: IDOMListener[] = [];

    // public $props: { [key: string]: Element };
    //
    public $beforeMount(): void {
    }

    public $mount(): void {
    }

    public $beforeUnmount(): void {
    }

    public $unmount(): void {
    }

    public $error(error: Error): void {
        console.log(error);
    }

    public $beforeDestroy(): void {
    }

    public $destroy(): void {
    }

    public $addListener(
        el: Element,
        event: string,
        delegateName: string,
        handler: EventListener,
        options?: useCapture | AddEventListenerOptions
    ): void ;
    public $addListener(
        el: Element,
        event: string,
        handler: EventListener,
        options?: useCapture | AddEventListenerOptions
    ): void;
    public $addListener(
        el: Element,
        event: string,
        delegateName_handler: string | EventListener,
        handler_options?: EventListener | useCapture | AddEventListenerOptions,
        options?: useCapture | AddEventListenerOptions
    ): void {
        // TODO: jQuery like api for events
        // TODO: delegated events with filtering
        if (typeof delegateName_handler !== 'string') { // handler
            el.addEventListener(event, delegateName_handler);
            this.DOMListeners.push({
                el,
                event,
                handler: delegateName_handler,
                options: handler_options as useCapture | AddEventListenerOptions
            });
        } else {
            console.log(options);
        }
    }

    public $removeListener(
        el: Element,
        event: string,
        handler: EventListener,
        options?: useCapture | EventListenerOptions
    ): void {
        el.removeEventListener(event, handler, options);
    }

    public removeListeners() {
        this.DOMListeners.forEach(listener => {
            const {el, event, handler} = listener;

            this.$removeListener(el, event, handler);
        });

        this.DOMListeners = [];
    }

    // private _tryCath<T extends (...args: any[]) => any>(this: this, fn: T): T {
    //   const self = this;
    //   return function(...args: any[]) {
    //     try {
    //       return fn(...args);
    //     } catch (error) {
    //       self.error(error);
    //     }
    //   } as T;
    // }

    public error(error: Error) {
        this.$error(error);
        // this.$emit("error");
    }

    public mount(target: Element, parent: Component | null = null): Component {
        this.$emit(LifeCycleHook.BEFORE_MOUNT);
        this.$beforeMount();
        this._mount(target);
        this.$parent = parent;
        this.$mount();
        this.$emit(LifeCycleHook.AFTER_MOUNT);
        // this.$emit('mount');
        return this;
    }

    public destroy(): void {
        this.$emit(LifeCycleHook.BEFORE_DESTROY);
        // this.$destroy();
        this.removeListeners();
        Object.values(this.$children)
            .forEach(components => {
                components.forEach(component => {
                    component.destroy();
                });
            });

        delete (this.$container as any).___DC___;
        this.$emit('destroy', {component: this});
    }

    public $getRef(name: string): Element[] {
        return [...this._findAvailable(this._config!.getSpecificRefSelector(name))];
    }

    public static isInComponentScope(component: Component, el: Element): boolean {
        return component.$container === el.parentElement!.closest(component._config!.specificComponentSelector);
    }

    private _findAvailable(selector: string): Element[] {
        return [...this.$container!.querySelectorAll(selector)]
            .filter((el: Element) => Component.isInComponentScope(this, el));
    }

    private _initRefs(): void {
        this._findAvailable(this._config!.refSelector)
            .forEach((el: Element) => {
                const refData = this._config!.getRefData(el);

                if (refData) {
                    (this.$refs[refData] || (this.$refs[refData] = [])).push(el);
                }
            });
    }

    private _initChildren(): void {
        this._findAvailable(Config.componentSelector)
            .forEach((el: Element) => {
                const componentName = Config.getComponentData(el);

                if (componentName) { // && this.$components[componentName]
                    const childrenComponent = new this.$components[componentName]();
                    childrenComponent.$once(LifeCycleHook.BEFORE_DESTROY, () => {
                        const childrenComponentIndex = this.$children[componentName].indexOf(childrenComponent);
                        console.log(childrenComponentIndex);
                        this.$children[componentName].splice(childrenComponentIndex, 1);
                    });

                    (this.$children[componentName] || (this.$children[componentName] = []))
                        .push(childrenComponent.mount(el, this));
                }
            });
    }

    private _mount(target: Element): void {
        this._config = new Config((this.constructor as typeof Component).$name);
        this.$container = target;
        this.refind();
        (this.$container as any).___DC___ = this;
    }

    public refind(): void {
        // init refs
        this._initRefs();
        // init children
        this._initChildren();
    }
}

