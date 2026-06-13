import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type HashRecord = Record<string, string | null>;
type HashUpdater = HashRecord | ((prev: HashRecord) => HashRecord);

export function useHash(): [HashRecord, (newHash: HashUpdater) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const hash: HashRecord = Object.fromEntries(searchParams.entries());

  const updateHash = useCallback(
    (newHash: HashUpdater) => {
      if (typeof newHash === "function") newHash = newHash(hash);
      const params = Object.fromEntries(
        Object.entries(newHash).filter(([, v]) => v != null) as [
          string,
          string,
        ][],
      );
      setSearchParams(params, { replace: true });
    },
    [hash, setSearchParams],
  );

  return [hash, updateHash];
}
