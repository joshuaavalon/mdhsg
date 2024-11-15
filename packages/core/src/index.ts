class ObjectBuilder<T extends Record<string, unknown> = {}> {
  private readonly jsonObject: T;

  private constructor(jsonObject: T) {
    this.jsonObject = jsonObject;
  }

  public static create(): ObjectBuilder {
    return new ObjectBuilder({});
  }

  public add<K extends string, V>(key: K, value: V): ObjectBuilder<Record<K, V> & T> {
    const nextPart = { [key]: value } as Record<K, V>;
    return new ObjectBuilder({ ...this.jsonObject, ...nextPart });
  }

  public build(): T {
    return this.jsonObject;
  }
}


const json = ObjectBuilder.create()
  .add("aString", "some text")
  .add("aNumber", 2)
  .add("anArray", [1, 2, 3])
  .build();
