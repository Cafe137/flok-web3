import { DisplaySettings } from "./display-settings.ts";
import { ErrorHandler } from "./types.ts";
import { isWebgl2Supported } from "./utils.js";
import { textmode, Textmodifier } from "textmode.js";
import { createFiltersPlugin } from "textmode.filters.js";

declare global {
  interface Window {
    t: Textmodifier;
  }
}

export class TextmodeWrapper {
  initialized: boolean = false;
  protected _textmodifier: Textmodifier | null = null;
  protected _sourceCanvas: HTMLCanvasElement;
  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _displaySettings: DisplaySettings;
  protected _evalId: number = 0;
  protected _hasError: boolean = false;
  protected _errorReported: boolean = false;
  protected _lastWorkingCode: string | null = null;
  protected _isRecovering: boolean = false;
  protected _successfulFrameCount: number = 0;
  protected _requiredSuccessFrames: number = 3; // Require N successful frames before saving as "working"

  constructor({
    sourceCanvas,
    onError,
    onWarning,
    displaySettings,
  }: {
    sourceCanvas: HTMLCanvasElement;
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
    displaySettings: DisplaySettings;
  }) {
    this._sourceCanvas = sourceCanvas;
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
    this._displaySettings = displaySettings;
  }

  setDisplaySettings(displaySettings: DisplaySettings) {
    this._displaySettings = displaySettings;

    // Update visibility based on showCanvas setting
    if (this._textmodifier) {
      this._textmodifier.canvas.style.display = displaySettings.showCanvas
        ? ""
        : "none";
    }
  }

  async initialize() {
    if (this.initialized) return;

    if (!isWebgl2Supported()) {
      this._onError("WebGL2 is not supported on this browser.");
      return;
    }

    try {
      this._textmodifier = textmode.create({
        canvas: this._sourceCanvas,
        overlay: true,
        fontSize: 16,
        frameRate: 60,
        plugins: [createFiltersPlugin()], // Add filters plugin for additional effects
      });

      // Expose the instance globally as `t`
      window.t = this._textmodifier;

      this.initialized = true;
      console.log("textmode.js initialized");
    } catch (error) {
      console.error("Failed to initialize textmode.js:", error);
      this._onError(`Failed to initialize textmode.js: ${error}`);
    }
  }

  async tryEval(code: string) {
    if (!this.initialized) await this.initialize();
    if (!this._textmodifier) return;

    // If we're in recovery mode, don't process new code
    if (this._isRecovering) return;

    const t = this._textmodifier;

    // Increment eval ID to invalidate old callbacks' error reporting
    const evalId = ++this._evalId;
    this._hasError = false;
    this._errorReported = false;
    this._successfulFrameCount = 0;

    // Clear existing layers before running new code
    t.layers.clear();

    const self = this;
    const currentCode = code;

    // Create error handler that triggers recovery
    const handleError = (error: any, context: string) => {
      // Only handle errors for the current eval
      if (evalId !== self._evalId) return;
      if (self._isRecovering) return;

      self._hasError = true;

      // Only report the first error per evaluation
      if (!self._errorReported) {
        self._errorReported = true;
        console.error(`textmode.js ${context} error:`, error);
        self._onError(`${error}`);
      }

      // Attempt to recover to last working code
      self._recoverToLastWorkingCode();
    };

    // Track successful frames to determine if code is stable
    const trackSuccess = () => {
      if (evalId !== self._evalId) return;
      if (self._hasError) return;

      self._successfulFrameCount++;
      if (self._successfulFrameCount >= self._requiredSuccessFrames) {
        // Code has been running successfully, save it
        self._lastWorkingCode = currentCode;
      }
    };

    // Wrap a draw callback with error handling and success tracking
    const wrapCallback = (fn: (instance: any) => void, context: string) => {
      return (instance: any) => {
        if (self._isRecovering) return;
        if (evalId !== self._evalId) return; // Stale callback
        try {
          fn(instance);
          trackSuccess();
        } catch (e) {
          handleError(e, context);
        }
      };
    };

    // Store original methods
    const originalDraw = t.draw.bind(t);
    const originalLayersAdd = t.layers.add.bind(t.layers);

    // Wrap t.draw() to protect callbacks
    (t as any).draw = (fn: (instance: any) => void) => {
      const wrappedFn = wrapCallback(fn, "draw");
      return (originalDraw as any)(wrappedFn);
    };

    // Wrap t.layers.add() to return layers with wrapped draw methods
    (t.layers as any).add = (options?: any) => {
      const layer = originalLayersAdd(options);
      const originalLayerDraw = layer.draw.bind(layer);

      // Wrap the layer's draw method
      layer.draw = (fn: (instance: any) => void) => {
        const wrappedFn = wrapCallback(fn, "layer.draw");
        return (originalLayerDraw as any)(wrappedFn);
      };

      return layer;
    };

    try {
      const wrappedCode = `
        (async () => {
          const t = window.t;
          ${code}
        })()
      `;

      await eval?.(wrappedCode);
    } catch (error) {
      console.error("textmode.js eval error:", error);
      self._onError(`${error}`);
      self._hasError = true;

      // Attempt to recover to last working code
      self._recoverToLastWorkingCode();
    } finally {
      // Restore original methods
      t.draw = originalDraw;
      t.layers.add = originalLayersAdd;
    }
  }

  protected async _recoverToLastWorkingCode() {
    if (this._isRecovering || !this._lastWorkingCode || !this._textmodifier) {
      return;
    }

    this._isRecovering = true;
    const t = this._textmodifier;

    try {
      // Clear current (broken) state
      t.layers.clear();

      // Re-evaluate the last working code
      const wrappedCode = `
        (async () => {
          const t = window.t;
          ${this._lastWorkingCode}
        })()
      `;

      await eval?.(wrappedCode);

      // this._onWarning("Recovered to last working state after error");
    } catch (e) {
      console.error("Failed to recover textmode.js state:", e);
      // If recovery fails, clear the last working code to prevent loops
      this._lastWorkingCode = null;
    } finally {
      this._isRecovering = false;
    }
  }

  dispose() {
    if (this._textmodifier) {
      // Use destroy() method to properly clean up used resources
      try {
        this._textmodifier.destroy?.();
      } catch (e) {
        // Ignore errors during dispose
      }
    }
    this._textmodifier = null;
    this._lastWorkingCode = null;
    this.initialized = false;
  }
}
