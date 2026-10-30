import { cp, mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const source = join(root, 'node_modules', 'kuromoji', 'dict')
const target = join(root, 'static', 'dict')

await mkdir(target, { recursive: true })

const files = await readdir(source)
let copied = 0

for (const file of files) {
  if (!file.endsWith('.dat.gz')) {
    continue
  }

  const from = join(source, file)
  const to = join(target, file)
  const sourceStat = await stat(from)

  let upToDate = false
  try {
    const targetStat = await stat(to)
    upToDate = targetStat.size === sourceStat.size
  } catch {
    upToDate = false
  }

  if (!upToDate) {
    await cp(from, to)
    copied += 1
  }
}

console.log(
  copied === 0
    ? 'kuromoji dictionary already present in static/dict'
    : `copied ${copied} kuromoji dictionary file(s) to static/dict`,
)
