import type { WatcherOptions } from "../deps.ts";
import type { CreateFilter } from "./createFilter.ts";
import { EventEmitter, exists, relative } from "../deps.ts";
import { ensureArray } from "./ensureArray.ts";
import { createFilter } from "./createFilter.ts";

const FILE_WATCH_DEBOUNCE_MS = 30;

/**
 * FileWatcher
 *
 * @private
 */
export class FileWatcher extends EventEmitter {
  private closed = false;
  private rootDir: string;
  private filter: CreateFilter;
  private queueMap: Map<string, string>;

  constructor(rootDir: string, { include, exclude }: WatcherOptions) {
    super();
    this.rootDir = rootDir;
    this.filter = createFilter(ensureArray(include), ensureArray(exclude));
    this.queueMap = new Map();
  }

  public close() {
    this.closed = true;
  }

  private flush() {
    this.queueMap.forEach((kind, id) => this.emit(kind, id));
    this.queueMap.clear();
  }

  public async watch() {
    const watcher = Deno.watchFs(this.rootDir);

    for await (let { kind, paths } of watcher) {
      if (this.closed) {
        break;
      } else if (["any", "access"].includes(kind)) {
        continue;
      }

      for (const path of paths) {
        if (this.filter(path)) {
          if (kind === "modify" && !(await exists(path))) {
            kind = "remove";
          }

          this.queueMap.set(relative(this.rootDir, path), kind);
          setTimeout(() => this.flush(), FILE_WATCH_DEBOUNCE_MS);
        }
      }
    }
  }
}
