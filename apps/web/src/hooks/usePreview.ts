import { useCallback, useEffect, useRef, useState } from "react";
import type { MemoSelection, StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload, TurnCycleState } from "../lib/types";
import { previewTurn } from "../lib/api";

export function usePreview(sessionId: string | null) {
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Monotonically increasing request generation: only the LATEST request may
  // publish. Aborting alone cannot stop a response that already resolved on the
  // server, so every async continuation re-checks the generation before touching
  // preview/error/loading — a slower old request can never replace the preview for
  // the current selections.
  const generationRef = useRef(0);

  const requestPreview = useCallback(
    (cycle: TurnCycleState, selections?: MemoSelection[], staffNegotiations?: StaffNegotiation[]) => {
      if (!sessionId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      // Invalidate the active request IMMEDIATELY (not after the debounce): bump the
      // generation and abort the in-flight fetch so a stale response cannot publish
      // even while the next debounce is still counting down.
      const generation = ++generationRef.current;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await previewTurn(sessionId, cycle, selections, staffNegotiations, signal);
          if (generationRef.current !== generation) return;
          setPreview(data);
        } catch (err) {
          if (generationRef.current !== generation) return;
          if ((err as { name?: string }).name !== "AbortError") {
            setError(err instanceof Error ? err.message : "Preview failed");
          }
        } finally {
          if (generationRef.current === generation) setLoading(false);
        }
      }, 400);
    },
    [sessionId],
  );

  const clearPreview = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Invalidate any in-flight request so its late response cannot resurrect a
    // preview after the screen moved on.
    generationRef.current += 1;
    if (abortRef.current) abortRef.current.abort();
    setPreview(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      generationRef.current += 1;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { preview, loading, error, requestPreview, clearPreview, setPreview };
}
