import { execFileSync } from "node:child_process"
import { appendFileSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim()
const stablePattern = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const previewPattern = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-hmg\.([1-9]\d*)$/

export function compareVersions(left, right) {
  const a = left.replace(/^v/, "").split(/[.-]/).map(Number)
  const b = right.replace(/^v/, "").split(/[.-]/).map(Number)
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

export function releaseLevel(messages) {
  let level = 0
  for (const message of messages) {
    if (/^BREAKING[ -]CHANGE:\s*\S/m.test(message) || /^[a-z]+(?:\([^\r\n)]+\))?!: /m.test(message)) return 3
    if (/^feat(?:\([^\r\n)]+\))?: /m.test(message)) level = Math.max(level, 2)
    if (/^fix(?:\([^\r\n)]+\))?: /m.test(message)) level = Math.max(level, 1)
  }
  return level
}

export function bumpVersion(version, level) {
  const [major, minor, patch] = version.split(".").map(Number)
  if (level === 3) return `${major + 1}.0.0`
  if (level === 2) return `${major}.${minor + 1}.0`
  if (level === 1) return `${major}.${minor}.${patch + 1}`
  return version
}

export function calculateVersion({ branch, initialVersion, tags, mergedTags, level, previewLevel }) {
  if (!["main", "hmg"].includes(branch)) throw new Error("Release permitida somente em main ou hmg")
  if (!stablePattern.test(`v${initialVersion}`)) throw new Error("Versão inicial inválida")
  const stable = mergedTags.filter((tag) => stablePattern.test(tag)).sort(compareVersions).at(-1)
  // Primeiro release estabelece o baseline, sem incrementar por todo o histórico antigo.
  const core = stable ? bumpVersion(stable.slice(1), level) : initialVersion
  if (branch === "main") return core

  const matching = tags.filter((tag) => previewPattern.test(tag) && tag.startsWith(`v${core}-hmg.`))
  const previous = matching.filter((tag) => mergedTags.includes(tag)).sort((a, b) => Number(a.split(".").at(-1)) - Number(b.split(".").at(-1))).at(-1)
  if (previous && previewLevel === 0) return previous.slice(1)
  const next = Math.max(0, ...matching.map((tag) => Number(tag.split(".").at(-1)))) + 1
  return `${core}-hmg.${next}`
}

export function generateVersion(branch) {
  const initialVersion = JSON.parse(readFileSync("package.json", "utf8")).version
  const tags = git("tag", "--list").split("\n").filter(Boolean)
  const mergedTags = git("tag", "--merged", "HEAD").split("\n").filter(Boolean)
  const stable = mergedTags.filter((tag) => stablePattern.test(tag)).sort(compareVersions).at(-1)
  const messages = (range) => git("log", "--format=%B%x00", range).split("\0")
  const level = stable ? releaseLevel(messages(`${stable}..HEAD`)) : 0
  const core = stable ? bumpVersion(stable.slice(1), level) : initialVersion
  const previous = mergedTags.filter((tag) => previewPattern.test(tag) && tag.startsWith(`v${core}-hmg.`))
    .sort((a, b) => Number(a.split(".").at(-1)) - Number(b.split(".").at(-1))).at(-1)
  const version = calculateVersion({ branch, initialVersion, tags, mergedTags, level, previewLevel: previous ? releaseLevel(messages(`${previous}..HEAD`)) : level })
  const tag = `v${version}`
  // Uma tag de outro histórico nunca pode ser silenciosamente reutilizada.
  if (tags.includes(tag) && !mergedTags.includes(tag)) throw new Error(`A tag ${tag} já existe fora deste histórico`)
  writeFileSync("lib/build-version.json", JSON.stringify({ version }, null, 2) + "\n")
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ntag=${tag}\ncreate_tag=${!tags.includes(tag)}\n`)
  console.log(tag)
  return version
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generateVersion(process.env.GITHUB_REF_NAME || process.argv[2] || git("branch", "--show-current"))
}
