import fs from 'fs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

/**
 * Validates the extracted text for hidden layers (white text on white background)
 * that might contain prompt injections.
 */
function checkForHiddenTextAnomalies(text: string): boolean {
  // A simplistic check: if the text is abnormally long but contains repeated patterns
  // or extremely dense paragraphs of non-standard characters, it might be an anomaly.
  // In a real PDF structure we'd check font color vs background color, but with pure text
  // we look for suspicious repeated injection phrases that shouldn't appear in normal CVs.
  const suspiciousDensity = text.split(/ignore previous instructions/i).length > 2
  return suspiciousDensity
}

export async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdfParse(dataBuffer)
  
  const text = data.text

  if (checkForHiddenTextAnomalies(text)) {
    console.warn('[PDF_EXTRACTOR] Anomalous text density detected. Possible hidden text injection.')
    // We could append a warning to the extracted text
    return `[WARNING: SUSPICIOUS PDF CONTENT DETECTED]\n${text}`
  }

  return text
}
