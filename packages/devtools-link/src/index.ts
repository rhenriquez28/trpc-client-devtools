import type { Operation, OperationResponse, TRPCLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import superjson from "superjson";

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

export function devtoolsLink<TRouter extends AnyRouter = AnyRouter>(
  opts: {
    enabled?: boolean;
  } = {}
): TRPCLink<TRouter> {
  const { enabled = true } = opts;
  return () => {
    function sendMessageToDevtools(
      payload: DevtoolsMessage<TRouter>["payload"]
    ) {
      window.postMessage(
        { source: "trpcDevtoolsLink", payload: superjson.stringify(payload) },
        "*"
      );
    }
    return ({ op, next, prev }) => {
      // ->
      enabled && sendMessageToDevtools(op);
      const requestStartTime = Date.now();
      next(op, (result) => {
        const elapsedMs = Date.now() - requestStartTime;
        enabled && sendMessageToDevtools({ ...op, result, elapsedMs });
        // <-
        prev(result);
      });
    };
  };
}
