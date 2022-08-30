import { Component as ClassComponent } from '../Component';
import { IOnMeta, On } from './On';
import { Hook } from './Hook';
import { Ref } from './Ref';
import { Children } from './Children';

interface IComponentOptions {
  name?: string;
  components: { [componentAlias: string]: new () => ClassComponent };
}

export function Component({
                            name,
                            components
                          }: IComponentOptions): ClassDecorator {
  // TODO: STRICTER
  return function(target: Function): any {
    // the new constructor behaviour
    function newConstructor(...args: any[]): ClassComponent {
      const instance = Reflect.construct(target, args) as ClassComponent;
      const constructor = instance.constructor as typeof ClassComponent;
      constructor.$name = name || target.name;
      instance.$components = Object.assign(components, {
        [constructor.$name]: newConstructor
      });
      // Component Instance explore
      Reflect.ownKeys(Reflect.getPrototypeOf(instance)).forEach(
        (propertyKey: PropertyKey) => {
          // region ON EXPLORE
          const onMetas: IOnMeta[] = Reflect.getMetadata(
            On.metaKey,
            instance,
            propertyKey as string
          );

          if (onMetas !== undefined) {
            onMetas.forEach((onMeta) => {
              const $init = instance.$mount;

              instance.$mount = function() {
                let focusedRefs = onMeta.refs(instance);
                if (focusedRefs) {
                  if (!Array.isArray(focusedRefs)) {
                    focusedRefs = [focusedRefs];
                  }
                  // console.log(instance);
                  // console.log(onMeta.event);
                  // console.log(onMeta.handler);

                  focusedRefs.forEach(el => {
                    instance.$addListener(
                      el,
                      onMeta.event,
                      onMeta.handlerWrapper(onMeta.handler.bind(instance)),
                      onMeta.options
                    );
                  });
                }
                $init.apply(instance, arguments as any);
              };
            });
          }
          // endregion

          // region HOOK EXPLORE
          const hookMeta = Reflect.getMetadata(
            Hook.metaKey,
            instance,
            propertyKey as string
          );

          if (hookMeta !== undefined) {
            // @ts-ignore
            // const $hook = instance['$' + hookMeta.hook];
            instance.$on(hookMeta.hook, hookMeta.handler.bind(instance));

            // @ts-ignore
            // instance['$' + hookMeta.hook] = function() {
            //   hookMeta.handler.apply(instance, arguments);
            //   $hook.apply(instance, arguments);
            // };
          }
          // endregion
        }
      );
      Reflect.ownKeys(instance)
        .forEach((propertyKey: PropertyKey) => {
          // region REFS EXPLORE
          const refMeta = Reflect.getMetadata(
            Ref.metaKey,
            instance,
            propertyKey as string
          );

          if (refMeta !== undefined) {
            const { name: refName, isRequired: isRequiredRef } = refMeta;
            const $init = instance.$mount;

            instance.$mount = function() {
              const foundElements = instance.$getRef(refName);
              // @ts-ignore
              if (isRequiredRef && foundElements.length === 0) {
                // @ts-ignore
                throw new Error(`In "${instance.constructor.name}" component can't find required ref "${instance._config.getSpecificRefSelector(refName)}".`);
              }
              // @ts-ignore
              instance[propertyKey] = foundElements;
              $init.apply(instance, arguments as any);
            };
          }
          // endregion

          // region CHILDREN EXPLORE
          const childrenMeta = Reflect.getMetadata(
            Children.metaKey,
            instance,
            propertyKey as string
          );

          if (childrenMeta !== undefined) {
            const $init = instance.$mount;

            instance.$mount = function() {
              // @ts-ignore
              instance[propertyKey] = instance.$children[childrenMeta.component.$name];
              $init.apply(instance, arguments as any);
            };
          }
          // endregion
        });

      return instance;
    }

    newConstructor.prototype = target.prototype;
    newConstructor.$name = name || target.name;
    Object.keys(target).forEach(key => {
      // @ts-ignore
      newConstructor[key] = target[key];
    });
    // newConstructor.prototype.constructor = newConstructor;

    return newConstructor;
  };
}
