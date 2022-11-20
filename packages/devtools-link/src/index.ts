import superjson from 'superjson';
import { Operation, OperationContext, OperationResultEnvelope, TRPCClientError, TRPCLink } from '@trpc/client';
import { AnyRouter } from '@trpc/server';
import { observable, tap } from '@trpc/server/observable';
import { TRPCResult } from '@trpc/server/rpc';


export type OperationResponse<TRouter extends AnyRouter, TOutput = unknown> =
  | TRPCResult<TOutput>
  | TRPCClientError<TRouter>;

type DevtoolsMessage<TRouter extends AnyRouter> = {
  source: "trpcDevtoolsLink";
  payload:
  | Operation
  | (Operation & {
    /**
     * Request result
     */
    result: OperationResponse<TRouter>;
    elapsedMs: number;
  });
};

export function devtoolsLink<TRouter extends AnyRouter = AnyRouter>(opts: {
  enabled?: boolean;
} = {}): TRPCLink<TRouter> {

  const { enabled = true } = opts;

  if (enabled && typeof window === "object") {
    window.__TRPC_CLIENT_HOOK__ = true;
  }

  function sendMessageToDevtools(
    payload: DevtoolsMessage<TRouter>["payload"]
  ) {

    window.postMessage(
      { source: "trpcDevtoolsLink", payload: superjson.stringify(payload) },
      "*"
    );

  }

  return () => {
    return ({ op, next }) => {
      return observable((observer) => {

        const requestStartTime = Date.now();
        function logResult(
          result: OperationResultEnvelope<unknown> | TRPCClientError<TRouter>,
        ) {
          const elapsedMs = Date.now() - requestStartTime;

          if (result instanceof TRPCClientError<TRouter>) {
            sendMessageToDevtools({
              ...op,
              elapsedMs,
              result: result
            })
          } else {
            sendMessageToDevtools({
              ...op,
              elapsedMs,
              result: result.result as unknown as OperationResponse<TRouter>,
              context: result.context as unknown as OperationContext
            })
          }

        }
        return next(op)
          .pipe(
            tap({
              next(result) {
                logResult(result);
              },
              error(result) {
                logResult(result);
              },
            }),
          )
          .subscribe(observer);
      });
    };
  };
}
