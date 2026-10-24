/** POST /api/extract-pdf: returns the text of an uploaded PDF (multipart field "file"). */

import { extractText, getDocumentProxy } from "unpdf";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const MAX_CHARS = 20_000;

const fail = (message: string, status = 400) => Response.json({ error: message }, { status });

export async function POST(req: Request) {
  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return fail("Upload a PDF file.");
  }

  if (!(file instanceof File)) return fail("Upload a PDF file.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return fail("That file isn't a PDF.");
  }
  if (file.size > MAX_BYTES) return fail("That PDF is too big (max 4 MB).", 413);

  try {
    const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = text
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, MAX_CHARS);

    if (!clean) {
      // Scanned PDFs are images with no text layer.
      return fail("No text found (scanned PDF?). Paste it instead.", 422);
    }
    return Response.json({ text: clean, pages: pdf.numPages });
  } catch {
    return fail("Couldn't read that PDF. Paste it instead.", 422);
  }
}
