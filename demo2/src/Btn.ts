import { Component } from './aop/Component';
import { Component as ClassComponent } from './Component';

@Component({
  components: {},
  name: 'btn'
})
export class Btn extends ClassComponent {
  // public static $name: string = 'btn';
}
