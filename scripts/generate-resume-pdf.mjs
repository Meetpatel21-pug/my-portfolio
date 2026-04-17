import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, PDFHexString, PDFName, StandardFonts, rgb } from 'pdf-lib'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(rootDir, 'public', 'Meet_Parsana_Resume.txt')
const outputPath = path.join(rootDir, 'public', 'Meet_Parsana_Resume.pdf')

const pageWidth = 612
const pageHeight = 792
const marginX = 44
const marginTop = 42
const marginBottom = 48
const contentWidth = pageWidth - marginX * 2

const titleFontSize = 22
const sectionFontSize = 12
const bodyFontSize = 9.4
const bodyLineGap = 13
const bulletLineGap = 12
const smallLineGap = 11

const accent = rgb(0.25, 0.64, 0.9)
const linkColor = rgb(0.1, 0.45, 0.82)
const textColor = rgb(0.11, 0.15, 0.22)
const mutedColor = rgb(0.35, 0.41, 0.49)

const resumeText = await readFile(sourcePath, 'utf8')
const sourceLines = resumeText.split(/\r?\n/)

const pdfDoc = await PDFDocument.create()
pdfDoc.setTitle('Meet Parsana Resume')
pdfDoc.setAuthor('Meet Parsana')
pdfDoc.setSubject('Resume')
pdfDoc.setCreator('Portfolio Project')
pdfDoc.setProducer('pdf-lib')
pdfDoc.setLanguage('en-US')

const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

let page = null
let cursorTop = marginTop

function startPage(isContinuation = false) {
  page = pdfDoc.addPage([pageWidth, pageHeight])
  cursorTop = marginTop

  if (isContinuation) {
    page.drawText('Meet Parsana Resume', {
      x: marginX,
      y: pageHeight - cursorTop - 12,
      font: boldFont,
      size: 12,
      color: mutedColor,
    })
    page.drawLine({
      start: { x: marginX, y: pageHeight - cursorTop - 18 },
      end: { x: pageWidth - marginX, y: pageHeight - cursorTop - 18 },
      thickness: 0.7,
      color: rgb(0.82, 0.86, 0.9),
    })
    cursorTop += 26
  }
}

function ensureSpace(requiredHeight) {
  if (cursorTop + requiredHeight > pageHeight - marginBottom) {
    startPage(true)
  }
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = text.trim().split(/\s+/)
  if (!words.length) return ['']

  const lines = []
  let currentLine = words[0]

  for (let index = 1; index < words.length; index += 1) {
    const nextWord = words[index]
    const candidateLine = `${currentLine} ${nextWord}`
    if (font.widthOfTextAtSize(candidateLine, fontSize) <= maxWidth) {
      currentLine = candidateLine
    } else {
      lines.push(currentLine)
      currentLine = nextWord
    }
  }

  lines.push(currentLine)
  return lines
}

function drawLine(text, { x = marginX, font = regularFont, size = bodyFontSize, color = textColor, gap = bodyLineGap, maxWidth = contentWidth, bold = false } = {}) {
  const drawFont = bold ? boldFont : font
  const wrapped = wrapText(text, drawFont, size, maxWidth)
  ensureSpace(wrapped.length * gap)

  for (const wrappedLine of wrapped) {
    const baseline = pageHeight - cursorTop - size
    page.drawText(wrappedLine, { x, y: baseline, font: drawFont, size, color })
    cursorTop += gap
  }
}

function drawSectionHeading(text) {
  ensureSpace(24)
  page.drawText(text, {
    x: marginX,
    y: pageHeight - cursorTop - sectionFontSize,
    font: boldFont,
    size: sectionFontSize,
    color: accent,
  })
  cursorTop += 14
  page.drawLine({
    start: { x: marginX, y: pageHeight - cursorTop - 4 },
    end: { x: pageWidth - marginX, y: pageHeight - cursorTop - 4 },
    thickness: 0.7,
    color: rgb(0.82, 0.86, 0.9),
  })
  cursorTop += 8
}

function addLinkAnnotation(x, yBaseline, width, height, url) {
  const annotation = pdfDoc.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: [x, yBaseline - 2, x + width, yBaseline + height],
    Border: [0, 0, 0],
    A: pdfDoc.context.obj({
      S: PDFName.of('URI'),
      URI: PDFHexString.fromText(url),
    }),
  })

  const annotationRef = pdfDoc.context.register(annotation)
  page.node.addAnnot(annotationRef)
}

function drawLinkLine(label, url, x = marginX, size = bodyFontSize) {
  const labelText = `${label}: `
  const baseline = pageHeight - cursorTop - size
  const labelWidth = regularFont.widthOfTextAtSize(labelText, size)
  const urlWidth = regularFont.widthOfTextAtSize(url, size)
  ensureSpace(bodyLineGap)

  page.drawText(labelText, {
    x,
    y: baseline,
    font: regularFont,
    size,
    color: textColor,
  })

  page.drawText(url, {
    x: x + labelWidth,
    y: baseline,
    font: regularFont,
    size,
    color: linkColor,
  })

  page.drawLine({
    start: { x: x + labelWidth, y: baseline - 1.5 },
    end: { x: x + labelWidth + urlWidth, y: baseline - 1.5 },
    thickness: 0.6,
    color: linkColor,
  })

  addLinkAnnotation(x + labelWidth, baseline, urlWidth, size + 4, url)
  cursorTop += bodyLineGap
}

function drawBulletedLine(text) {
  const indent = 16
  const maxWidth = contentWidth - indent
  const wrapped = wrapText(text, regularFont, bodyFontSize, maxWidth)
  ensureSpace(wrapped.length * bulletLineGap)

  wrapped.forEach((line, index) => {
    const baseline = pageHeight - cursorTop - bodyFontSize
    const x = marginX + indent
    if (index === 0) {
      page.drawText('•', {
        x: marginX,
        y: baseline,
        font: boldFont,
        size: bodyFontSize,
        color: accent,
      })
    }
    page.drawText(line, {
      x,
      y: baseline,
      font: regularFont,
      size: bodyFontSize,
      color: textColor,
    })
    cursorTop += bulletLineGap
  })
}

function drawProjectTitle(text) {
  drawLine(text, { font: boldFont, size: 10, color: textColor, gap: smallLineGap, bold: true })
}

function drawPlainBody(text) {
  drawLine(text, { font: regularFont, size: bodyFontSize, color: textColor, gap: bodyLineGap })
}

startPage(false)

for (const [index, rawLine] of sourceLines.entries()) {
  const line = rawLine.trim()
  if (!line) {
    cursorTop += 5
    continue
  }

  if (index === 0) {
    ensureSpace(34)
    page.drawText(line, {
      x: marginX,
      y: pageHeight - cursorTop - titleFontSize,
      font: boldFont,
      size: titleFontSize,
      color: textColor,
    })
    cursorTop += 28
    continue
  }

  if (line === line.toUpperCase() && /[A-Z]/.test(line) && line.length <= 18) {
    drawSectionHeading(line)
    continue
  }

  if (/^(LinkedIn|GitHub):\s+https?:\/\//i.test(line)) {
    const [label, url] = line.split(/:\s+/, 2)
    drawLinkLine(label, url)
    continue
  }

  if (/^Repo:\s+https?:\/\//i.test(line)) {
    const [label, url] = line.split(/:\s+/, 2)
    drawLinkLine(label, url, marginX + 16)
    continue
  }

  if (/^\d+\)/.test(line)) {
    drawProjectTitle(line)
    continue
  }

  if (line.startsWith('- ')) {
    drawBulletedLine(line.slice(2))
    continue
  }

  if (/^(Ahmedabad, India|Phone:|Email:)/i.test(line)) {
    drawPlainBody(line)
    continue
  }

  drawPlainBody(line)
}

const pdfBytes = await pdfDoc.save()
await writeFile(outputPath, pdfBytes)

console.log(`Wrote ${outputPath}`)