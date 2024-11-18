type RequiredRecord<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
};

type Buildable<Target extends Record<string, unknown>, Value extends Partial<Target>> = Value extends RequiredRecord<Target> ? Target : never;

export class Builder<Target extends Record<string, unknown>, Value extends Partial<Target> = {}> {
  private readonly value: Value;

  private constructor(value: Value) {
    this.value = value;
  }

  public set<Key extends keyof Target>(key: Key, value: Target[Key]): Builder<Target, Record<Key, Target[Key]> & Value> {
    const newValue = { [key]: value } as Record<Key, Target[Key]>;
    return new Builder({ ...this.value, ...newValue });
  }

  public get(): Value {
    return { ...this.value };
  }

  public build(): Buildable<Target, Value> {
    return this.value as unknown as Buildable<Target, Value>;
  }

  public static create<Target extends Record<string, unknown>>(): Builder<Target> {
    return new Builder({});
  }
}

export interface ExtendBuilder<Target extends Record<string, unknown>, Attr extends keyof Target> {
  <Value extends Partial<Target>, T extends Builder<Target, Value>>(b: T): Builder<Target, Record<Attr, Target[Attr]> & Value>;
}
