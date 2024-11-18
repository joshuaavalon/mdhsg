import type { Task } from "./type.js";

async function main(args: string[]): Promise<void> {
  if (!Array.isArray(args) || args.length !== 1) {
    throw new Error(`Invalid args: ${JSON.stringify(args)}`);
  }
  const task: Task = await import(`./task/${args}.js`);
  console.log(task);
}

main(process.argv.slice(2));
