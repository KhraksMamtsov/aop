export class Utils {
  public static namespace2obj<T>(
    namespace: string,
    value: T
  ): Record<string, T> {
    const result = {};
    let cursor = result;

    const namespacePath = namespace.split(":");

    for (let i = 0, l = namespacePath.length - 1; i <= l; i++) {
      // @ts-ignore
      cursor = cursor[namespacePath[i]] = i === l ? value : {};
    }

    return result;
  }
}
