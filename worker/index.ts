import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const staticAsset = /\.(?:avif|css|gif|html|ico|jpe?g|js|json|map|png|svg|webp)$/i;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }

    if (staticAsset.test(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    return handler.fetch(request, env, ctx);
  }
};

