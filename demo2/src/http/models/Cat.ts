import V from 'class-validator';

export class Cat {
  @V.Length(0, 1)
  public name!: string;
}
