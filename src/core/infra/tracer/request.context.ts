import { createNamespace, getNamespace, Namespace } from 'cls-hooked';

const REQUEST_CONTEXT_NAMESPACE = 'REQUEST_CONTEXT';

export class RequestContext {
  private static readonly namespace: Namespace = createNamespace(
    REQUEST_CONTEXT_NAMESPACE
  );

  static run(callback: () => void) {
    this.namespace.run(callback);
  }

  static set(key: string, value: any) {
    this.namespace.set(key, value);
  }

  static get<T>(key: string): T | undefined {
    return this.namespace.get(key);
  }

  static getTracerId(): string | undefined {
    return this.get<string>('tracerId');
  }

  static setTracerId(tracerId: string) {
    this.set('tracerId', tracerId);
  }
}
