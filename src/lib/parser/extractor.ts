export async function extractText(ai: Ai, file: File, buffer: ArrayBuffer): Promise<string> {
  const blob = new Blob([buffer], { type: file.type || "application/pdf" });
  const converted = await ai.toMarkdown({ name: file.name, blob }).catch(() => null);
  return converted && converted.format !== "error" ? converted.data || "" : "";
}
