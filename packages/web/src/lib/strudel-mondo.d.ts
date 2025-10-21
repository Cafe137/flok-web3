declare module "@strudel/mondo" {
  import { Pattern } from "@strudel/core";

  /**
   * Tagged template function for Mondo Language syntax.
   * Parses Mondo code and returns a Strudel Pattern.
   *
   * @example
   * mondo`s hh*8`
   * mondo`note [c e g]*4`
   */
  export function mondo(
    code: string | TemplateStringsArray,
    offset?: number,
  ): Pattern;

  /**
   * Similar to mondo, but with zero offset.
   * Used internally by the REPL.
   */
  export function mondolang(code: string | TemplateStringsArray): Pattern;

  /**
   * Mondo notation for inline patterns (square brackets).
   *
   * @example
   * mondi`c e g`
   */
  export function mondi(str: string, offset?: number): Pattern;

  /**
   * Gets source code locations for syntax highlighting and error reporting.
   *
   * @param code - The Mondo source code
   * @param offset - Starting offset in the source file
   * @returns Array of location tuples [start, end]
   */
  export function getLocations(
    code: string,
    offset: number,
  ): [number, number][];
}
