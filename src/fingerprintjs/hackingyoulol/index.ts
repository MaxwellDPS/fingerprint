import * as FingerprintJS from '../src'
import { errorToObject } from '../src/utils/misc'

type Text = string | { html: string }

async function getVisitorData() {
  const fp = await FingerprintJS.load({ debug: true })
  return await fp.get()
}

async function startPlayground() {
  const output = document.querySelector('.output')
  if (!output) {
    throw new Error("The output element isn't found in the HTML code")
  }

  const startTime = Date.now()

  try {
    const { visitorId, confidence, components } = await getVisitorData()
    const totalTime = Date.now() - startTime
    var componets_json = JSON.parse(FingerprintJS.componentsToDebugString(components))
    delete componets_json["canvas"]
    componets_json = JSON.stringify(
      componets_json,
      (_key, value) => {
        if (value instanceof Error) {
          return errorToObject(value)
        }
        return value
      },
      2
    )

    output.innerHTML = ''
    addOutputSection({ output, header: 'Visitor identifier:', content: visitorId, size: 'giant' })
    addOutputSection({ output, header: 'Time took to get the identifier:', content: `${totalTime}ms`, size: 'big' })
    addOutputSection({
      output,
      header: 'Confidence score:',
      content: String(confidence.score),
      comment: '',
      size: 'big',
    })
    addOutputSection({ output, header: 'User agent:', content: navigator.userAgent })
    addOutputSection({
      output,
      header: 'Entropy components:',
      content: componets_json,
    })

    initializeDebugButtons(`Visitor identifier: \`${visitorId}\`
Time took to get the identifier: ${totalTime}ms
Confidence: ${JSON.stringify(confidence)}
User agent: \`${navigator.userAgent}\`
Entropy components:
\`\`\`
${componets_json}
\`\`\``)
  } catch (error) {
    const totalTime = Date.now() - startTime
    const errorData = error instanceof Error ? errorToObject(error) : error
    output.innerHTML = ''
    addOutputSection({ output, header: 'Unexpected error:', content: JSON.stringify(errorData, null, 2) })
    addOutputSection({ output, header: 'Time passed before the error:', content: `${totalTime}ms`, size: 'big' })
    addOutputSection({ output, header: 'User agent:', content: navigator.userAgent })

    initializeDebugButtons(`Unexpected error:\n
\`\`\`
${JSON.stringify(errorData, null, 2)}
\`\`\`
Time passed before the error: ${totalTime}ms
User agent: \`${navigator.userAgent}\``)
    throw error
  }
}

function addOutputSection({
  output,
  header,
  content,
  comment,
  size,
}: {
  output: Node
  header: Text
  content: Text
  comment?: Text
  size?: 'big' | 'giant'
}) {
  const headerElement = document.createElement('div')
  headerElement.appendChild(textToDOM(header))
  headerElement.classList.add('heading')
  output.appendChild(headerElement)

  const contentElement = document.createElement('pre')
  contentElement.appendChild(textToDOM(content))
  if (size) {
    contentElement.classList.add(size)
  }
  output.appendChild(contentElement)

  if (comment) {
    const commentElement = document.createElement('div')
    commentElement.appendChild(textToDOM(comment))
    commentElement.classList.add('comment')
    output.appendChild(commentElement)
  }
}

function initializeDebugButtons(debugText: string) {
  const copyButton = document.querySelector('#debugCopy')
  if (copyButton instanceof HTMLButtonElement) {
    copyButton.disabled = false
    copyButton.addEventListener('click', (event) => {
      event.preventDefault()
      copy(debugText)
    })
  }

  const rickrollButton = document.querySelector('#learnMore')
  if (rickrollButton instanceof HTMLButtonElement) {
    rickrollButton.disabled = false
    rickrollButton.addEventListener('click', (event) => {
      event.preventDefault()
      rickroll()
    })
  }
}

function copy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
  } catch {
    // Do nothing in case of a copying error
  }
  document.body.removeChild(textarea)
}

async function rickroll() {
  const rickroll_url = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';
  alert("Always think carefully about the links you click")
  window.location.href = rickroll_url;
}

function textToDOM(text: Text): Node {
  if (typeof text === 'string') {
    return document.createTextNode(text)
  }
  const container = document.createElement('div')
  container.innerHTML = text.html
  const fragment = document.createDocumentFragment()
  while (container.firstChild) {
    fragment.appendChild(container.firstChild)
  }
  return fragment
}

startPlayground()
