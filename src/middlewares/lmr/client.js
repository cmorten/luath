/// <reference lib="dom" />

const RE_QUERYSTRING = /\?.*$/;
const RE_HASH = /#.*$/;
const RE_CSS = /\.(css)($|\?)/;

const stripUrl = (url) => url.replace(RE_QUERYSTRING, "").replace(RE_HASH, "");

const isCssExtension = (fileName) => RE_CSS.test(fileName);

function logInfo(...args) {
  console.info("[lmr] ", ...args);
}

function logError(...args) {
  console.error("[lmr] ", ...args);
}

function reload() {
  window.location.reload();
}

const channel = new MessageChannel();
const url = `${location.origin.replace("http", "ws")}/_lmr`;

let ws;

function connectWebSocket(cb = () => {}) {
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

const RE_INDEX_HTML = /\/(index\.html)($|\?)/;

const updateQueue = [];
let updating = false;

function dequeue() {
  updating = updateQueue.length !== 0;

  if (updating) {
    update(updateQueue.shift()).then(dequeue, dequeue);
  }
}

function handleMessage(message) {
  const data = JSON.parse(message.data);

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
            style(url);

            return;
          } else if (
            url.replace(RE_INDEX_HTML, "") ===
            resolveUrl(location.pathname).replace(RE_INDEX_HTML, "")
          ) {
            return reload();
          } else {
            // @ts-ignore
            for (const node of document.querySelectorAll("[src],[href]")) {
              const attribute = node.src ? "src" : "href";
              const value = node[attribute];

              if (value && stripUrl(resolveUrl(value)) === url) {
                node[attribute] = `${stripUrl(value)}?mtime=${Date.now()}`;
              }
            }

            return;
          }
        }

        if (!updateQueue.includes(url)) {
          updateQueue.push(url);
        }

        if (!updating) {
          dequeue();
        }
      });

      break;
    }
    case "error": {
      logError(data.error);

      break;
    }
    default: {
      logInfo("unknown message", data);
    }
  }
}

function handleError() {}

const CONNECTION_RETRY_TIMEOUT = 5000;

function handleClose(event) {
  if (!event.wasClean) {
    logInfo("connection lost - reconnecting...");
    setTimeout(() => connectWebSocket(reload), CONNECTION_RETRY_TIMEOUT);
  }
}

function update(url) {
  const oldModule = getModule(url);
  const accept = Array.from(oldModule.accept);
  const dispose = Array.from(oldModule.dispose);
  const newUrl = `${url}?mtime=${Date.now()}`;
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
      logError("hmr error", err);
    });
}

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
  const _module = getModule(url);

  return {
    accept(fn) {
      channel.port1.postMessage(
        JSON.stringify({
          id: url.replace(location.origin, ""),
          type: "hotAccepted",
        })
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

export function style(filename) {
  const id = resolveUrl(filename);
  const oldNode = styles.get(id);

  const newNode = document.createElement("link");
  newNode.rel = "stylesheet";
  newNode.href = oldNode ? `${filename}?mtime=${Date.now()}` : filename;
  document.head.appendChild(newNode);

  styles.set(id, newNode);

  if (oldNode) {
    newNode.onload = () => document.head.removeChild(oldNode);
  }
}
