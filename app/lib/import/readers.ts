// Dependency-free readers for .xlsx and .csv files.
// .xlsx is a zip of XML files; we read the zip directory, inflate entries with the
// built-in DecompressionStream, and pull cell values out of the sheet XML.

export interface Sheet {
  name: string
  rows: string[][]
}

// ---------- CSV ----------
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const src = text.replace(/^﻿/, '')
  // Detect delimiter from the first line (comma, semicolon or tab)
  const firstLine = src.split(/\r?\n/, 1)[0] ?? ''
  const counts = [',', ';', '\t'].map(d => [d, firstLine.split(d).length] as const)
  const delim = counts.sort((a, b) => b[1] - a[1])[0][0]

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === delim) { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(v => v.trim() !== ''))
}

// ---------- ZIP ----------
async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw')
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(ds)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function readZip(buf: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const bytes = new Uint8Array(buf)
  const view = new DataView(buf)
  // Find End Of Central Directory record (signature 0x06054b50) near the end
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('This file is not a valid .xlsx workbook.')
  const entries = view.getUint16(eocd + 10, true)
  let ptr = view.getUint32(eocd + 16, true)
  const out = new Map<string, Uint8Array>()
  const dec = new TextDecoder()
  for (let n = 0; n < entries; n++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break
    const method = view.getUint16(ptr + 10, true)
    const compSize = view.getUint32(ptr + 20, true)
    const nameLen = view.getUint16(ptr + 28, true)
    const extraLen = view.getUint16(ptr + 30, true)
    const commentLen = view.getUint16(ptr + 32, true)
    const localOffset = view.getUint32(ptr + 42, true)
    const name = dec.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen))
    ptr += 46 + nameLen + extraLen + commentLen

    if (!/^xl\/(workbook\.xml|sharedStrings\.xml|worksheets\/sheet\d+\.xml|_rels\/workbook\.xml\.rels)$/.test(name)) continue
    const lNameLen = view.getUint16(localOffset + 26, true)
    const lExtraLen = view.getUint16(localOffset + 28, true)
    const start = localOffset + 30 + lNameLen + lExtraLen
    const raw = bytes.subarray(start, start + compSize)
    if (method === 0) out.set(name, raw)
    else if (method === 8) out.set(name, await inflateRaw(raw))
    else throw new Error(`Unsupported compression in ${name}.`)
  }
  return out
}

// ---------- XML helpers ----------
const decodeXml = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')

const textOf = (xml: string) => {
  let out = ''
  const re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) out += decodeXml(m[1] ?? '')
  return out
}

const attr = (tag: string, name: string) => {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag)
  return m ? decodeXml(m[1]) : undefined
}

const colIndex = (ref: string) => {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? 'A'
  let n = 0
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

export async function readXlsx(buf: ArrayBuffer): Promise<Sheet[]> {
  const files = await readZip(buf)
  const dec = new TextDecoder()
  const xml = (p: string) => (files.has(p) ? dec.decode(files.get(p)!) : '')

  const shared: string[] = []
  const ss = xml('xl/sharedStrings.xml')
  const siRe = /<si>([\s\S]*?)<\/si>/g
  let m: RegExpExecArray | null
  while ((m = siRe.exec(ss))) shared.push(textOf(m[1]))

  // Map sheet names -> worksheet files via workbook rels
  const rels = new Map<string, string>()
  const relRe = /<Relationship\b[^>]*>/g
  const relXml = xml('xl/_rels/workbook.xml.rels')
  while ((m = relRe.exec(relXml))) {
    const id = attr(m[0], 'Id'); const target = attr(m[0], 'Target')
    if (id && target) rels.set(id, target.replace(/^\/?xl\//, '').replace(/^\//, ''))
  }
  const sheets: Sheet[] = []
  const sheetRe = /<sheet\b[^>]*\/?>/g
  const wb = xml('xl/workbook.xml')
  while ((m = sheetRe.exec(wb))) {
    const name = attr(m[0], 'name') ?? `Sheet${sheets.length + 1}`
    const rid = attr(m[0], 'r:id')
    const target = (rid && rels.get(rid)) || `worksheets/sheet${sheets.length + 1}.xml`
    const sheetXml = xml(`xl/${target}`)
    sheets.push({ name, rows: parseSheet(sheetXml, shared) })
  }
  return sheets
}

function parseSheet(sheetXml: string, shared: string[]): string[][] {
  const rows: string[][] = []
  const rowRe = /<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g
  let rm: RegExpExecArray | null
  while ((rm = rowRe.exec(sheetXml))) {
    const rowXml = rm[1] ?? ''
    const row: string[] = []
    const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
    let cm: RegExpExecArray | null
    let next = 0
    while ((cm = cellRe.exec(rowXml))) {
      const attrs = ' ' + cm[1]
      const inner = cm[2] ?? ''
      const ref = attr(attrs, 'r')
      const idx = ref ? colIndex(ref) : next
      next = idx + 1
      const type = attr(attrs, 't')
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1]
      let value = ''
      if (type === 's') value = shared[Number(v)] ?? ''
      else if (type === 'inlineStr') value = textOf(inner)
      else if (type === 'b') value = v === '1' ? 'TRUE' : 'FALSE'
      else if (v !== undefined) value = decodeXml(v)
      while (row.length < idx) row.push('')
      row[idx] = value
    }
    rows.push(row)
  }
  return rows.filter(r => r.some(v => v.trim() !== ''))
}

export async function readSpreadsheetFile(file: File): Promise<Sheet[]> {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || file.type === 'text/csv') {
    return [{ name: file.name.replace(/\.[^.]+$/, ''), rows: parseCsv(await file.text()) }]
  }
  if (lower.endsWith('.xlsx')) return readXlsx(await file.arrayBuffer())
  if (lower.endsWith('.xls')) throw new Error('Old .xls files are not supported. Save the file as .xlsx or .csv and try again.')
  throw new Error('Please upload a .xlsx or .csv file.')
}
