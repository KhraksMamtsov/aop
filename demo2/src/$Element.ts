export class $Element {
  // public static of(root: Element, selector: string): $Element;
  // public static of(root: Element, elements: Element[]): $Element;
  public static of(root: Element, selectorOrElement: string | Element[]): $Element {
    return new $Element(root, selectorOrElement);
  }

  private readonly _root: Element;
  private readonly _elements: Element[];

  // constructor(root: Element, selector: string);
  // constructor(root: Element, elements: Element[]);
  constructor(root: Element, selectorOrElement: string | Element[]) {
    // if(root instanceof Element) {
    this._root = root;
    if (Array.isArray(selectorOrElement)) {
      this._elements = selectorOrElement;
    } else {
      this._elements = [...this._root.querySelectorAll(selectorOrElement)];
    }
  }

  public map<T>(fn: (element: Element) => T): T[] {
    return this._elements.map(fn);
  }

  private _map(fn: (element: Element) => Element | Element[]): $Element {
    // check scope
    const transformResult = this
      .map(fn)
      .reduce<Element[]>((acc, current) => acc.concat(current), []);
    return $Element.of(this._root, transformResult);
  }

  public each(fn: (element: Element) => void): $Element {
    this._elements.forEach(fn);
    return this;
  }

  // public includes(comparableElement: $Element): boolean {
  //   return this.map(element => element === comparableElement)
  //     .includes(true);
  // }

  // public includes(comparableElement: Element): boolean {
  //   return this.map(element => element === comparableElement)
  //     .includes(true);
  // }

  public includes(selector: string): boolean {
    return this.map(el => el.matches(selector))
      .includes(true)
  }

  public find(selector: string): $Element {
    return this._map(el => [...el.querySelectorAll(selector)]);
  }

  public eq(index: number): $Element {
    return $Element.of(this._root, [this.get(index)]);
  }

  public get(index: number): Element {
    return this._elements[index];
  }

  public get length(): number {
    return this._elements.length;
  }

  public [Symbol.iterator](): Element[] {
    return this._elements;
  }
}
