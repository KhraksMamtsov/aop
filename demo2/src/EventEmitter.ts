export type IHandler = (...payload: any[]) => void;

export interface IListener {
  handler: IHandler;
  isOnce: boolean;
}

export class EventEmitter {
  private readonly listeners: { [event: string]: IListener[] } = {};

  public $on(event: string, handler: IHandler): void {
    this.safeAddListener(event, {
      handler,
      isOnce: false
    });
  }

  public $off(event: string, handler?: IListener["handler"]): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter(
      listener => listener.handler !== handler
    );
  }

  public $once(event: string, handler: IHandler): void {
    this.safeAddListener(event, {
      handler,
      isOnce: true
    });
  }

  public $emit(event: string, ...payload: any[]): void {
    Object.keys(this.listeners).forEach(key => {
      if (event === key) {
        this.listeners[key].forEach(listener => {
          listener.handler(...payload);

          if (listener.isOnce) {
            this.$off(key, listener.handler);
            // this.listeners[key].splice(index, 1);
          }
        });
      }
    });
  }

  private safeAddListener(event: string, listener: IListener): void {
    (this.listeners[event] || (this.listeners[event] = [])).push(listener);
  }
}
