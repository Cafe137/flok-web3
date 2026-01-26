import { execSync } from "child_process";
import * as path from "path";
import { CommandREPL, CommandREPLContext } from "../repl.js";
import debugModule from "debug";

const debug = debugModule("flok:repl:zwirn");

class ZwirnREPL extends CommandREPL {
  constructor(ctx: CommandREPLContext) {
    super(ctx);

    this.command = "zwirnzi";
    this.args = ["--ci.cli"];
  }

  write(body: string) {
    const newBody = this.prepare(body);
    this.repl.stdin.write(`${newBody}\n`);

    const lines = newBody.split("\n");
    this.emitter.emit("data", { type: "stdin", lines });
  }

  prepare(body: string): string {
    let newBody = super.prepare(body);
    newBody = `:{\n${newBody}\n:}`;
    return newBody;
  }

  handleData(type: string, lines: string[]): string[] {
    return type == "stdout"
      ? lines.map((line) => line.replace(/(>> )+/i, ""))
      : lines;
  }
}

export default ZwirnREPL;
