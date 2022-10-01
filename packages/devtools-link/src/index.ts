import type {
  Operation,
  OperationResultEnvelope,
  TRPCClientError,
  TRPCLink,
} from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { observable, tap } from "@trpc/server/observable";
import superjson from "superjson";

type DevtoolsMessage<TRouter extends AnyRouter> = {
  source: "trpcDevtoolsLink";
  payload:
    | Operation
    | (Operation & {
        /**
         * Request result
         */
        result: OperationResultEnvelope<unknown> | TRPCClientError<TRouter>;
        elapsedMs: number;
      });
};

export function devtoolsLink<TRouter extends AnyRouter = AnyRouter>(
  opts: {
    enabled?: boolean;
  } = {}
): TRPCLink<TRouter> {
  const { enabled = true } = opts;

  if (enabled && typeof window === "object") {
    (window as any).__TRPC_CLIENT_HOOK__ = true;
  }

  function sendMessageToDevtools(payload: DevtoolsMessage<TRouter>["payload"]) {
    if (typeof window === "object") {
      window.postMessage(
        { source: "trpcDevtoolsLink", payload: superjson.stringify(payload) },
        "*"
      );
    }
  }

  return () => {
    return ({ op, next }) => {
      return observable((observer) => {
        enabled && sendMessageToDevtools(op);
        const requestStartTime = Date.now();

        function handleResult(
          result: OperationResultEnvelope<unknown> | TRPCClientError<TRouter>
        ) {
          const elapsedMs = Date.now() - requestStartTime;
          enabled && sendMessageToDevtools({ ...op, result, elapsedMs });
        }

        return next(op)
          .pipe(
            tap({
              next(result) {
                handleResult(result);
              },
              error(result) {
                handleResult(result);
              },
            })
          )
          .subscribe(observer);
      });
    };
  };
}
