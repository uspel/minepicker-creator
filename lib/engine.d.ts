interface Console {
  /**
   * Outputs a debugging message at the `info` log level. This functions in the same way as {@link console.info()} and {@link print()}.
   *
   * In order for this message to display in the content log GUI, you must have the `GUI Log Level` creator setting set to `Info`.
   *
   * @example
   * ```js
   * console.log("Hello world!");
   * ```
   * `[Scripting][inform]-Hello world!`
   */
  log(...args: any[]): void;
  /**
   * Outputs a debugging message at the `info` log level. This functions in the same way as {@link console.log()} and {@link print()}.
   *
   * In order for this message to display in the content log GUI, you must have the `GUI Log Level` creator setting set to `Info`.
   *
   * @example
   * ```js
   * console.info("Hello world!");
   * ```
   * `[Scripting][inform]-Hello world!`
   */
  info(...args: any[]): void;
  /**
   * Outputs a debugging message at the `warn` log level.
   *
   * In order for this message to display in the content log GUI, you must have the `GUI Log Level` creator setting set to `Info` or `Warn`.
   *
   * @example
   * ```js
   * console.warn("Hello world!");
   * ```
   * `[Scripting][warning]-Hello world!`
   */
  warn(...args: any[]): void;
  /**
   * Outputs a debugging message at the `error` log level.
   *
   * @example
   * ```js
   * console.error("Hello world!");
   * ```
   * `[Scripting][error]-Hello world!`
   */
  error(...args: any[]): void;
}

declare var console: Console;

/**
 * Outputs a debugging message at the `info` log level. This functions in the same way as {@link console.info()} and {@link console.log()}.
 *
 * In order for this message to display in the content log GUI, you must have the `GUI Log Level` creator setting set to `Info`.
 *
 * @example
 * ```js
 * print("Hello world!");
 * ```
 * `[Scripting][inform]-Hello world!`
 */
declare function print(...args: any[]): void;

/**
 * Evaluates JavaScript code and executes it.
 *
 * Requires the `script_eval` pack manifest capability.
 *
 * @param x A String value that contains valid JavaScript code.
 */
declare function eval(x: string): any;

interface FunctionConstructor {
  /**
   * Creates a new function.
   *
   * Requires the `script_eval` pack manifest capability.
   * 
   * @param args A list of arguments the function accepts.
   */
  new (...args: string[]): Function;
  /**
   * Requires the `script_eval` pack manifest capability.
   */
  (...args: string[]): Function;
}