import type { WatcherOptions } from "../deps.ts";
import type { CreateFilter } from "./createFilter.ts";
import { EventEmitter, relative } from "../deps.ts";
import { ensureArray } from "./ensureArray.ts";
import { createFilter } from "./createFilter.ts";

/**
 * FileWatcher
 * 
 * @private
 */
export class FileWatcher extends EventEmitter {
  private closed = false;
  private rootDir: string;
  private filter: CreateFilter;

  constructor(rootDir: string, { include, exclude }: WatcherOptions) {
    super();
    this.rootDir = rootDir;
    this.filter = createFilter(ensureArray(include), ensureArray(exclude));
  }

  public close() {
    this.closed = true;
  }

  public async watch() {
    const watcher = Deno.watchFs(this.rootDir);

    for await (const { kind, paths } of watcher) {
      if (this.closed) {
        break;
      } else if (["any", "access"].includes(kind)) {
        continue;
      }

      for (const path of paths) {
        if (this.filter(path)) {
          this.emit(kind, relative(this.rootDir, path));
        }
      }
    }
  }
}
