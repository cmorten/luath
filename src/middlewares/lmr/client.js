// deno-lint-ignore-file no-undef
/// <reference lib="dom" />

const RE_QUERYSTRING = /\?.*$/;
const RE_HASH = /#.*$/;

const RE_CSS = /\.css($|\?|&|#)/;
const RE_INDEX_HTML = /\/(index\.html)($|\?|&|#)/;

const stripUrl = (url) => url.replace(RE_QUERYSTRING, "").replace(RE_HASH, "");

const isCssExtension = (fileName) => RE_CSS.test(fileName);

function logInfo(...args) {
  console.info("[lmr] ", ...args);
}

let errorOverlay;

function showErrorOverlay(error) {
  if (!errorOverlay) {
    errorOverlay = document.createElement("div");
    errorOverlay.style =
      "box-sizing: border-box; width: 100%; height: 100%; position: fixed; top: 0; left: 0; padding: 15px; font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 16px; background: #fffb;";

    errorOverlay.innerHTML =
      `<div style="background: #16242C; padding: 25px; border-top: 12px solid #6060bb; border-radius: 4px; position: relative; max-height: 100%; overflow-y: scroll; box-sizing: border-box;">` +
      `<button id="$luath_close" style="border: 0; color: #C0C4CD; width: 20px; height: 20px; background: transparent; position: absolute; top: 15px; right: 15px; font-size: 20px; padding: 0; cursor: pointer;">&#10005;</button>` +
      `<pre id="$luath_message" style="white-space: pre-wrap; color: #EC5E66;"></pre>` +
      `<pre id="$luath_stack" style="white-space: pre-wrap; color: #C0C4CD;"></pre>` +
      `</div>`;

    document.body.appendChild(errorOverlay);
    document.getElementById("$luath_close").onclick = () => hideErrorOverlay();
  }

  document.getElementById("$luath_message").textContent = error.message;
  document.getElementById("$luath_stack").textContent = error.stack.replace(error.message, '');
}

function hideErrorOverlay() {
  if (errorOverlay) {
    document.body.removeChild(errorOverlay);
    errorOverlay = null;
  }
}

function logError(error) {
  console.error("[lmr] ", error);

  if (error.message !== "error loading dynamically imported module") {
    showErrorOverlay(error);
  }
}

function reload() {
  window.location.reload();
}

const channel = new MessageChannel();
const url = `${location.origin.replace("http", "ws")}/$luath/lmr`;

let ws;

function connectWebSocket(cb = () => {}) {
  if (ws) {
    try {
      ws.close();
    } catch (_) {
      // swallow
    }
  }

  ws = new WebSocket(url);
  ws.addEventListener("open", () => {
    cb();
    forwardMessages();
  });
  ws.addEventListener("message", handleMessage);
  ws.addEventListener("error", handleError);
  ws.addEventListener("close", handleClose);
}

connectWebSocket();

function forwardMessages() {
  logInfo("server connected");

  channel.port2.onmessage = (message) => ws.send(message.data);
}

const resolveUrl = (url) => new URL(url, location.origin).href;

let updateQueue = [];
let updating = false;

function dequeue() {
  updating = updateQueue.length !== 0;

  if (updating) {
    const updates = updateQueue.map((item) => update(item));
    Promise.all(updates).then(dequeue, dequeue);
    updateQueue = [];
  }
}

function handleMessage(message) {
  hideErrorOverlay();

  const data = JSON.parse(message.data);
  const mtime = data?.mtime ?? Date.now();

  switch (data.type) {
    case "reload": {
      logInfo("reloading...");
      reload();

      break;
    }
    case "update": {
      data.changes.forEach((path) => {
        const url = stripUrl(resolveUrl(path));

        if (!modules.get(url)) {
          if (isCssExtension(url)) {
            style(url, mtime);

            return;
          } else if (
            url.replace(RE_INDEX_HTML, "") ===
              resolveUrl(location.pathname).replace(RE_INDEX_HTML, "")
          ) {
            return reload();
          } else {
            for (const node of document.querySelectorAll("[src],[href]")) {
              const attribute = node.src ? "src" : "href";
              const value = node[attribute];

              if (value && stripUrl(resolveUrl(value)) === url) {
                node[attribute] = `${stripUrl(value)}?mtime=${mtime}`;
              }
            }

            return;
          }
        }

        if (!updateQueue.find(({ url: existingUrl }) => existingUrl === url)) {
          updateQueue.push({ url, mtime });
        }

        if (!updating) {
          dequeue();
        }
      });

      break;
    }
    case "error": {
      const error = Object.assign(new Error(data.error.message), data.error);
      logError(error);

      break;
    }
    default: {
      logInfo("unknown message", data);
    }
  }
}

function handleError() {}

const CONNECTION_RETRY_TIMEOUT = 1000;

let reconnectHandle;

function handleClose(event) {
  if (!event.wasClean) {
    logInfo("connection lost - reconnecting...");

    if (reconnectHandle) {
      clearTimeout(reconnectHandle);
    }

    reconnectHandle = setTimeout(
      () => connectWebSocket(reload),
      CONNECTION_RETRY_TIMEOUT,
    );
  }
}

function update({ url, mtime }) {
  const oldModule = getModule(url);
  const accept = Array.from(oldModule.accept);
  const dispose = Array.from(oldModule.dispose);
  const newUrl = `${url}?mtime=${mtime}`;
  const newModulePromise = import(newUrl);

  return newModulePromise
    .then((newModule) => {
      accept.forEach((fn) => {
        fn({ module: newModule });

        oldModule.accept.delete(fn);
      });

      dispose.forEach((fn) => {
        fn();

        oldModule.dispose.delete(fn);
      });
    })
    .catch((err) => {
      logError(err);
    });
}

window.addEventListener("error", (event) => {
  logError(event.error);
});

const modules = new Map();

function getModule(url) {
  url = stripUrl(url);

  const _module = modules.get(url);

  if (_module) {
    return _module;
  }

  const newModule = { accept: new Set(), dispose: new Set() };

  modules.set(url, newModule);

  return newModule;
}

export function luath(url) {
  if (!url) {
    return;
  }

  const _module = getModule(url);

  return {
    accept(fn) {
      channel.port1.postMessage(
        JSON.stringify({
          id: url.replace(location.origin, ""),
          type: "hotAccepted",
        }),
      );

      if (fn) {
        _module.accept.add(fn);
      }
    },
    dispose(fn) {
      if (fn) {
        _module.remove.add(fn);
      }
    },
    invalidate() {
      reload();
    },
  };
}

const styles = new Map();

export function style(filename, mtime = Date.now()) {
  const id = resolveUrl(filename);
  const oldNode = styles.get(id);
  const newNode = document.createElement("link");
  newNode.rel = "stylesheet";
  newNode.href = oldNode ? `${filename}?mtime=${mtime}` : filename;
  document.head.appendChild(newNode);

  styles.set(id, newNode);

  if (oldNode) {
    newNode.onload = () => {
      setTimeout(() => {
        try {
          document.head.removeChild(oldNode);
        } catch (_) {
          // swallow
        }
      }, 1000);
    };
  }
}
