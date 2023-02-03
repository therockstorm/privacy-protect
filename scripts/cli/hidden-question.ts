import readline from "readline";

export function hiddenQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const stdin = process.openStdin();
    process.stdin.on("data", (char) => {
      switch (char.toString()) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          readline.cursorTo(process.stdout, 0, 0, () => {
            process.stdout.write(query + Array(rl.line.length + 1).join("*"));
            return false;
          });
          break;
      }
    });
    rl.question(query, resolve);
  });
}
