import { useEvalHandler } from "@/hooks/use-eval-handler";
import { useSettings } from "@/hooks/use-settings";
import { defaultDisplaySettings } from "@/lib/display-settings";
import { TextmodeWrapper } from "@/lib/textmode-wrapper";
import { isWebgl2Supported, sendToast } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

export function Component() {
  const hasWebGl2 = useMemo(() => isWebgl2Supported(), []);
  const [instance, setInstance] = useState<TextmodeWrapper | null>(null);
  const [displaySettings, setDisplaySettings] = useState(
    defaultDisplaySettings,
  );

  useEffect(() => {
    if (hasWebGl2) return;
    sendToast(
      "warning",
      "WebGL2 not available",
      "WebGL2 is disabled or not supported, so textmode.js was not initialized",
    );
  }, [hasWebGl2]);

  // Initialize textmode.js wrapper
  useEffect(() => {
    if (!hasWebGl2) return;

    (async () => {
      const textmodeWrapper = new TextmodeWrapper({
        onError: (err) => {
          sendToast("destructive", "textmode.js error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "textmode.js warning", msg);
        },
        displaySettings: displaySettings,
      });

      await textmodeWrapper.initialize();
      setInstance(textmodeWrapper);
    })();
  }, []);

  // Update display settings when they change
  useEffect(() => {
    instance?.setDisplaySettings(displaySettings);
  }, [displaySettings, instance]);

  // Handle code evaluation messages from parent window
  useEvalHandler(
    useCallback(
      (msg) => {
        if (!instance) return;
        instance.tryEval(msg.body);
      },
      [instance],
    ),
  );

  // Handle settings updates from parent window
  useSettings(
    useCallback(
      (msg) => {
        if (!instance) return;
        if (msg.displaySettings) {
          setDisplaySettings(msg.displaySettings);
        }
      },
      [instance],
    ),
  );

  // textmode.js creates its own canvas and appends it to document.body
  // No need to render a container element
  return null;
}
