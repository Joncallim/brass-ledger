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

  const requestPreview = useCallback(
    (cycle: TurnCycleState, selections?: MemoSelection[], staffNegotiations?: StaffNegotiation[]) => {
      if (!sessionId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        setError(null);
        try {
          const data = await previewTurn(sessionId, cycle, selections, staffNegotiations);
          setPreview(data);
        } catch (err) {
          if ((err as { name?: string }).name !== "AbortError") {
            setError(err instanceof Error ? err.message : "Preview failed");
          }
        } finally {
          setLoading(false);
        }
      }, 400);
    },
    [sessionId],
  );

  const clearPreview = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPreview(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { preview, loading, error, requestPreview, clearPreview, setPreview };
}
