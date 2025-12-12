import HydraCanvas from "@/components/hydra-canvas";
import { useAnimationFrame } from "@/hooks/use-animation-frame";
import { useEvalHandler } from "@/hooks/use-eval-handler";
import { useSettings } from "@/hooks/use-settings";
import { defaultDisplaySettings } from "@/lib/display-settings";
import { HydraWrapper } from "@/lib/hydra-wrapper";
import { TextmodeWrapper } from "@/lib/textmode-wrapper";
import { isWebgl2Supported, sendToast } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    m: number; // meter value from Mercury
  }
}

export function Component() {
  const hydraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasWebGl2 = useMemo(() => isWebgl2Supported(), []);
  const [hydraInstance, setHydraInstance] = useState<HydraWrapper | null>(null);
  const [textmodeInstance, setTextmodeInstance] =
    useState<TextmodeWrapper | null>(null);
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

  // Initialize Hydra and textmode.js
  useEffect(() => {
    if (!hasWebGl2) return;
    const canvas = hydraCanvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let hydra: HydraWrapper | null = null;
    let textmode: TextmodeWrapper | null = null;

    (async () => {
      // Initialize Hydra on the canvas (background layer)
      // Hydra is secondary in this target, so suppress errors/warnings
      hydra = new HydraWrapper({
        canvas,
        onError: () => {
          // Silently ignore Hydra errors in textmode target
        },
        onWarning: () => {
          // Silently ignore Hydra warnings in textmode target
        },
        displaySettings: displaySettings,
      });

      await hydra.initialize();
      if (disposed) return;
      setHydraInstance(hydra);

      // Initialize textmode.js in overlay mode on top of the Hydra canvas
      // This is the primary renderer, so show all errors/warnings
      textmode = new TextmodeWrapper({
        sourceCanvas: canvas,
        onError: (err) => {
          sendToast("destructive", "textmode.js error", err.toString());
        },
        onWarning: (msg) => {
          sendToast("warning", "textmode.js warning", msg);
        },
        displaySettings: displaySettings,
      });

      await textmode.initialize();
      if (disposed) return;
      setTextmodeInstance(textmode);
    })();

    return () => {
      disposed = true;
      if (textmode) {
        textmode.dispose();
      }
      setHydraInstance(null);
      setTextmodeInstance(null);
    };
  }, [hasWebGl2]);

  // Sync global values from parent window for Mercury and Strudel integration
  useAnimationFrame(
    useCallback(() => {
      window.m = window.parent?.mercury?.m;
      window.strudel = window.parent?.strudel?.strudel;
    }, []),
  );

  // Update display settings when they change
  useEffect(() => {
    hydraInstance?.setDisplaySettings(displaySettings);
    textmodeInstance?.setDisplaySettings(displaySettings);
  }, [displaySettings, hydraInstance, textmodeInstance]);

  // Handle code evaluation messages from parent window
  // Evaluate on both Hydra and textmode.js - each will handle its own code
  // and ignore errors from code meant for the other
  useEvalHandler(
    useCallback(
      (msg) => {
        // Evaluate on Hydra (for visual backgrounds, etc.)
        // Hydra will ignore textmode.js-specific code that throws errors
        if (hydraInstance) {
          hydraInstance.tryEval(msg.body);
        }
        // Evaluate on textmode.js (for text-based visuals)
        if (textmodeInstance) {
          textmodeInstance.tryEval(msg.body);
        }
      },
      [hydraInstance, textmodeInstance],
    ),
  );

  // Handle settings updates from parent window
  useSettings(
    useCallback((msg) => {
      if (msg.displaySettings) {
        setDisplaySettings(msg.displaySettings);
      }
    }, []),
  );

  // Render the Hydra canvas as background, textmode.js will overlay on top of it
  return (
    hasWebGl2 && (
      <HydraCanvas
        ref={hydraCanvasRef}
        fullscreen
        displaySettings={displaySettings}
      />
    )
  );
}
