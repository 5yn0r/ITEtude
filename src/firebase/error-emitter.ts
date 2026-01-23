type Listener<T> = (data: T) => void;

class Emitter<TEventMap extends Record<string, any>> {
  private listeners: { [K in keyof TEventMap]?: Listener<TEventMap[K]>[] } = {};

  on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]) {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach(listener => listener(data));
    }
  }
}

import type { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': FirestorePermissionError;
};

export const errorEmitter = new Emitter<Events>();

    