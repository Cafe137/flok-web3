import { DisplaySettings } from "./display-settings.ts";
import { ErrorHandler } from "./types.ts";
import { isWebgl2Supported } from "./utils.js";
import { textmode, Textmodifier } from "textmode.js";

declare global {
  interface Window {
    t: Textmodifier;
  }
}

export class TextmodeWrapper {
  initialized: boolean = false;
  protected _textmodifier: Textmodifier | null = null;
  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _displaySettings: DisplaySettings;
  protected _evalId: number = 0;
  protected _hasError: boolean = false;
  protected _lastWorkingCallback: ((instance: any) => void) | null = null;

  constructor({
    onError,
    onWarning,
    displaySettings,
  }: {
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
    displaySettings: DisplaySettings;
  }) {
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
      // Create a new Textmodifier instance
      // The instance creates its own canvas and appends it to document.body
      this._textmodifier = textmode.create({
        width: window.innerWidth,
        height: window.innerHeight,
        fontSize: 16,
        frameRate: 60,
      });

      // Style the canvas
      if (this._textmodifier.canvas) {
        const canvas = this._textmodifier.canvas;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
      }

      // Register windowResized callback for automatic resize handling
      this._textmodifier.windowResized(() => {
        this._textmodifier?.resizeCanvas(window.innerWidth, window.innerHeight);
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

    // Increment eval ID to invalidate old callbacks' error reporting
    const evalId = ++this._evalId;
    this._hasError = false;

    // Expose handlers for the eval context
    const self = this;
    (window as any).__tm = {
      evalId,
      onError(error: any, id: number) {
        if (id !== self._evalId || self._hasError) return;
        self._hasError = true;
        console.error("textmode.js draw error:", error);
        self._onError(`${error}`);
      },
      get lastCallback() {
        return self._lastWorkingCallback;
      },
      set lastCallback(cb) {
        self._lastWorkingCallback = cb;
      },
    };

    try {
      const wrappedCode = `
        (async () => {
          const t = window.t;
          const __draw = t.draw.bind(t);
          const __id = ${evalId};
          
          t.draw = (fn) => __draw((i) => {
            try {
              fn(i);
              window.__tm.lastCallback = fn;
            } catch (e) {
              window.__tm.onError(e, __id);
              window.__tm.lastCallback?.(i);
            }
          });
          
          ${code}
          
          t.draw = __draw;
        })()
      `;

      await eval?.(wrappedCode);
    } catch (error) {
      console.error("textmode.js error:", error);
      this._onError(`${error}`);
    }
  }

  dispose() {
    if (this._textmodifier) {
      // Use destroy() method to properly clean up used resources
      this._textmodifier.destroy?.();
    }
    this._textmodifier = null;
    this.initialized = false;
    console.log("textmode.js disposed");
  }
}
