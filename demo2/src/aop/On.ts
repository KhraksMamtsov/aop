import 'reflect-metadata';

import { Component } from '../Component';

type EventHandler = (event: Event) => void;
type PipeableEventHandler = (cb: EventHandler) => EventHandler;

export interface IOnMeta<I = any> {
  event: string;
  handler: (...args: any) => any;
  handlerWrapper: PipeableEventHandler;
  options: AddEventListenerOptions,
  refs: (x: I) => Element | Element[];
}

export class On<I extends Component> {
  public get prevent(): this {
    return this.pipelineHandler((event, nextHandler) => {
      event.preventDefault();
      nextHandler(event);
    });
  }

  public get stop(): this {
    return this.pipelineHandler((event, nextHandler) => {
      event.stopPropagation();
      nextHandler(event);
    });
  }

  public get stopImmediate(): this {
    return this.pipelineHandler((event, nextHandler) => {
      event.stopImmediatePropagation();
      nextHandler(event);
    });
  }

  public get self(): this {
    return this.if(e => e.target === e.currentTarget);
  }

  public get capture(): this {
    this.options.capture = true;
    return this;
  }

  public get once(): this {
    this.options.once = true;
    return this;
  }

  public get passive(): this {
    this.options.passive = true;
    return this;
  }

  public get $(): MethodDecorator {
    return <T>(
      target: Object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<T>
    ) => {
      const existingMetadata = Reflect.getMetadata(
        On.metaKey,
        target,
        propertyKey
      ) || [];

      Reflect.defineMetadata(
        On.metaKey,
        existingMetadata.concat(
          {
            event: this.event,
            handler: descriptor.value,
            handlerWrapper: this.pipe,
            options: this.options,
            refs: this.refs
          }),
        target,
        propertyKey
      );
    };
  };

  private get pipe(): PipeableEventHandler {
    return (handler: EventHandler) => this.handlersPipe.reduceRight((acc, cur) => cur(acc), handler);
  }

  public static metaKey = Symbol('DELETE_COMPONENT_ON_META_KEY');

  public static container(event: IOnMeta['event'], options?: IOnMeta['options']) {
    return new On(event, x => x.$container, options);
  }

  public static event<I extends Component>(
    event: IOnMeta<I>['event'],
    refs: IOnMeta<I>['refs'],
    options?: IOnMeta<I>['options']) {
    return new On<I>(event, refs, options);
  }

  private handlersPipe: PipeableEventHandler[] = [];

  private constructor(
    private readonly event: IOnMeta<I>['event'],
    private readonly refs: IOnMeta<I>['refs'],
    private readonly options: IOnMeta<I>['options'] = {} // remember of useCapture
  ) {
  }

  public if(predicate: (event: Event) => boolean): this {
    return this.pipelineHandler((event, nextHandler) => {
      if (predicate(event)) {
        nextHandler(event);
      }
    });
  }

  public delegate(refName: string): this {
    return this.if(event => (event.target instanceof Element) ? event.target.matches(refName) : false);
  }

  private pipelineHandler(handler: (event: Event, nextHandler: EventHandler) => void): this {
    this.handlersPipe
      .push((nextHandler: EventHandler) => (event: Event) => {
        handler(event, nextHandler);
      });
    return this;
  }
}
