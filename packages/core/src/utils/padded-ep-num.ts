export function paddedEpNum(episode: number): (templates: TemplateStringsArray, ...padSizes: number[]) => string {
  return (templates, ...padSizes) => templates
    .map((template, i) => {
      const paddedSize = padSizes[i];
      const padEpNum = paddedSize ? episode.toString().padStart(paddedSize, "0") : "";
      return template + padEpNum;
    })
    .join("");
}
