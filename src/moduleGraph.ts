export interface Module {
  dependencies: Set<string>;
  dependents: Set<string>;
  stale?: boolean;
  mtime?: number;
  acceptingUpdates?: boolean;
  code?: string;
  type?: string;
}

export class ModuleGraph extends Map<string, Module> {
  ensure(id: string) {
    if (!this.has(id)) {
      this.set(id, {
        dependencies: new Set(),
        dependents: new Set(),
      });
    }

    return this.get(id) as Module;
  }
}
