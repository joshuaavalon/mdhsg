export function formatName(value: string): string {
  return value.normalize("NFKC")
    .replaceAll("...", "…")
    .replaceAll("・・・", "…")
    .trim()
    .replaceAll(/\s+/gu, " ");
}
