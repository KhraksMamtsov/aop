// @ts-ignore
import {Children, Component, Hook, On, Ref} from './aop';
import {Btn} from './Btn';
import {Component as ClassComponent, LifeCycleHook} from './Component';

export default function LOG<T>(
  _target: Object,
  _key: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  console.log(123123123);
  // replace the supplied property descriptor with a hello world logger!
  const originalMethod = descriptor.value;
  // @ts-ignore
  descriptor.value = function(...args) {
    console.log('LOG');
    // @ts-ignore
    originalMethod.apply(this, args);
  };
  return descriptor;
  // return {
  //   value(...args: any[]) {
  //     console.log('hello world');
  //     // @ts-ignore
  //     return descriptor.value.apply(this, args);
  //   }
  // } as any;
}

@Component({
  components: { btn: Btn },
  name: 'app'
})
export class App extends ClassComponent {
  public static asd = 222;
  private initialBG = "";

  public constructor() {
    super();
    App.asd = 444;
    console.log(App.asd);
  }

  @Ref('btn')
  public button: Element[] = [];

  @Ref('qwe')
  public qwe: Element[] = [];

  @Children(Btn)
  public btns: Btn[] = [];

  @Children(App)
  public apps: App[] = [];

  public asd?: string;

  // @On.event<App>("dblclick", x => x.button).$
  @On.event('click', (x: App) => x.button).self.$
  // @new On("click", x => x.$el).$
  // @On.stop.prevent("click", x => x.$el).stop.prevent.$
  public log1(e: Event) {
    console.log(e.target, e.currentTarget);
    // console.log(1, e.type, this);
    // console.dir((this.$container as HTMLElement).style.background = (this.is = !this.is) ? 'red' : 'transparent');
  }

  // @new On<App>("click", x => x.button).$
  // @LOG
  public log(e: Event) {
    console.log(e);
    console.log(this);
  }

  @Hook(LifeCycleHook.AFTER_MOUNT)
  public colorBG() {
    this.initialBG = (this.$container as HTMLElement).style.background || "";
    (this.$container as HTMLElement).style.background = "green";
    // @ts-ignore
    // this.log1()
    // this.button.forEach(btn => {
    //   this.$addListener(btn, 'click', e => {
    //     console.log('from INIT');
    //     console.log(e);
    //     this.log( new Event(""));
    //   });
    // });
  }

  @Hook(LifeCycleHook.AFTER_DESTROY)
  public uncolorBG() {
    (this.$container as HTMLElement).style.background = this.initialBG;
    // @ts-ignore
    // this.log1()
    // this.button.forEach(btn => {
    //   this.$addListener(btn, 'click', e => {
    //     console.log('from INIT');
    //     console.log(e);
    //     this.log( new Event(""));
    //   });
    // });
  }
}

//     @       -->      Model       ===  View Model :: Class Component  -->  Simple Component
// ----------       --------------       -----------------------------       ----------------
// Annotation       Business Logic                         Facade                Component
