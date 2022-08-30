export class Config {
  public get refSelector() {
    return `[${this.refDataAttr}]`;
  }

  public get refDataAttr() {
    return `data-${Config.prefix}-${this.componentName}-ref`;
  }

  public get specificComponentSelector() {
    return `[${Config.componentDataAttr}="${this.componentName}"]`;
  }

  public static prefix = 'dc';
  public static componentDataAttr = `data-${Config.prefix}-component`;
  public static componentSelector = `[${Config.componentDataAttr}]`;

  public static camelize(str: string) {
    return str.replace(/-./g, word => word.charAt(1).toUpperCase());
  }

  public static getComponentData(el: Element): string | null {
    // console.log(Config.camelize(Config.componentDataAttr));
    return el.getAttribute(Config.componentDataAttr);
  }

  constructor(private readonly componentName: string) {
  }

  public getSpecificRefSelector(name: string) {
    return `[${this.refDataAttr}=${name}]`;
  }

  public getRefData(el: Element): string | null {
    return el.getAttribute(this.refDataAttr);
  }
}
