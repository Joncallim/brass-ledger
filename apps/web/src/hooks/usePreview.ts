import { useCallback, useEffect, useRef, useState } from "react";
import type { MemoSelection, StaffNegotiation } from "@brass-ledger/shared";
import type { PreviewPayload, TurnCycleState } from "../lib/types";
import { previewTurn } from "../lib/api";

/** Deterministic key for the exact selection/negotiation set a preview was
 * requested with. Proceeding must only trust a preview whose key matches the
 * CURRENT selections — otherwise an already-published preview for earlier choices
 * can reach the chiefs/precommit flow during the next debounce.
 *
 * The key is a JSON serialization of SORTED structured tuples that include
 * EVERY field of every selection and negotiation (including the optional
 * negotiation note). Delimiter concatenation is not collision-free:
 * `{memoId:"a", optionId:"b:c"}` and `{memoId:"a:b", optionId:"c"}` both encode
 * to `a:b:c` under `:`/`|` joining, while `JSON.stringify` of tuples is
 * injective over schema-valid values (closing pass 3 P2). Sorting by the
 * serialized tuple keeps the key order-independent. */
export function previewFingerprint(selections: MemoSelection[], staffNegotiations: StaffNegotiation[]): string {
  const tupleKey = (tuple: (string | number | null)[]) => JSON.stringify(tuple);
  const selectionKey = JSON.stringify(
    [...selections]
      .map((s) => [s.memoId, s.optionId])
      .sort((a, b) => (tupleKey(a) < tupleKey(b) ? -1 : tupleKey(a) > tupleKey(b) ? 1 : 0)),
  );
  const negotiationKey = JSON.stringify(
    [...staffNegotiations]
      .map((n) => [n.directorate, n.reliefPoints, n.cost, n.note ?? null])
      .sort((a, b) => (tupleKey(a) < tupleKey(b) ? -1 : tupleKey(a) > tupleKey(b) ? 1 : 0)),
  );
  return `${selectionKey}\u00a7${negotiationKey}`;
}

export function usePreview(sessionId: string | null) {
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  // Fingerprint of the selections/negotiations the CURRENT preview was produced
  // for. null while no preview is published. App compares this against the live
  // selection fingerprint before letting the player proceed.
  const [previewKey, setPreviewKey] = useState<string | null>(null);
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

      // Invalidate the active request AND the published preview IMMEDIATELY (not
      // after the debounce): bump the generation, abort the in-flight fetch, and
      // drop any already-published preview so a stale response cannot publish —
      // and a stale preview cannot be consumed — while the next debounce is still
      // counting down.
      const generation = ++generationRef.current;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      setPreview(null);
      setPreviewKey(null);

      const fingerprint = previewFingerprint(selections ?? cycle.selections, staffNegotiations ?? cycle.staffNegotiations);

      timerRef.current = setTimeout(async () => {
        // The request may have been superseded while the debounce was counting
        // down (clearTimeout only helps before the callback has started): a stale
        // callback must not publish loading/error state either.
        if (generationRef.current !== generation) return;
        setLoading(true);
        setError(null);
        try {
          const data = await previewTurn(sessionId, cycle, selections, staffNegotiations, signal);
          if (generationRef.current !== generation) return;
          setPreview(data);
          setPreviewKey(fingerprint);
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
    setPreviewKey(null);
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

  return { preview, previewKey, loading, error, requestPreview, clearPreview, setPreview };
}
