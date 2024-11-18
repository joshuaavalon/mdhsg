import type { Task } from "./type.js";

async function main(args: string[]): Promise<void> {
  if (!Array.isArray(args) || args.length !== 2) {
    throw new Error(`Invalid args: ${JSON.stringify(args)}`);
  }
  const series = args[0];
  if (!series) {
    throw new Error(`Invalid series: ${series}`);
  }
  const episodeNumStr = args[1];
  const episodeNum = Number.parseInt(episodeNumStr ?? "");
  if (Number.isNaN(episodeNum)) {
    throw new Error(`Invalid episodeNum: ${series}`);
  }
  const module = await import(`./task/${series}.js`);
  const task = module.task as Task;
  console.log(task);
}

main(process.argv.slice(2));
