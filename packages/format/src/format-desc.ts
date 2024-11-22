export function formatDesc(value: string): string {
  return value.normalize("NFKC")
    .replaceAll("...", "…")
    .replaceAll("・・・", "…")
    .trim()
    .replace(/^ *(?<val>\S+)/gmu, "$<val>")
    .replace(/(?<val>\S+) *$/gmu, "$<val>")
    .replaceAll(/、\s+/gu, "、")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .replaceAll("\n", "<br/>\n")
    .replaceAll("</h3><br/>\n", "</h3>\n")
    .replaceAll("</h2><br/>\n", "</h2>\n")
    .replaceAll("</h1><br/>\n", "</h1>\n");
}
