import readline from "readline";

export function hiddenQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    process.stdin.on("keypress", () => {
      const len = rl.line.length;
      readline.moveCursor(process.stdout, -len, 0);
      readline.clearLine(process.stdout, 1);
      process.stdout.write("*".repeat(len));
    });

    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
