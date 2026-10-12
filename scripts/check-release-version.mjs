import { strict as assert } from "node:assert"
import { bumpVersion, calculateVersion, compareVersions, releaseLevel } from "./release-version.mjs"

let checks = 0
function check(name, actual, expected) {
  assert.deepEqual(actual, expected, name)
  checks++
  console.log(`ok ${name}`)
}
check("fix com escopo incrementa patch", releaseLevel(["fix(auth): corrigir login"]), 1)
check("feat incrementa minor", releaseLevel(["feat: nova tela", "fix: correção"]), 2)
check("exclamação incrementa major", releaseLevel(["feat(api)!: novo contrato"]), 3)
check("breaking no rodapé incrementa major", releaseLevel(["refactor: contrato\n\nBREAKING CHANGE: resposta incompatível"]), 3)
check("breaking com hífen incrementa major", releaseLevel(["refactor: contrato\n\nBREAKING-CHANGE: incompatível"]), 3)
check("docs e chore não incrementam", releaseLevel(["docs: manual", "chore: ferramentas"]), 0)
check("patch", bumpVersion("0.1.0", 1), "0.1.1")
check("minor", bumpVersion("0.1.3", 2), "0.2.0")
check("major mesmo em 0.x", bumpVersion("0.1.3", 3), "1.0.0")
check("ordenação numérica", compareVersions("v0.10.0", "v0.9.9") > 0, true)

const base = { branch: "master", initialVersion: "0.1.0", tags: [], mergedTags: [], level: 2, previewLevel: 2 }
check("primeira produção estabelece 0.1.0", calculateVersion(base), "0.1.0")
check("primeira HMG", calculateVersion({ ...base, branch: "hmg" }), "0.1.0-hmg.1")
const released = { ...base, tags: ["v0.1.0"], mergedTags: ["v0.1.0"] }
check("feat após produção", calculateVersion(released), "0.2.0")
check("fix após produção", calculateVersion({ ...released, level: 1 }), "0.1.1")
check("docs após produção mantém versão", calculateVersion({ ...released, level: 0 }), "0.1.0")
const preview = { ...released, branch: "hmg", tags: ["v0.1.0", "v0.2.0-hmg.1"], mergedTags: ["v0.1.0", "v0.2.0-hmg.1"] }
check("nova alteração na HMG incrementa pré-versão", calculateVersion(preview), "0.2.0-hmg.2")
check("docs na HMG mantém pré-versão", calculateVersion({ ...preview, previewLevel: 0 }), "0.2.0-hmg.1")
check("promoção HMG para produção remove sufixo", calculateVersion({ ...preview, branch: "master" }), "0.2.0")
check("tags de outros históricos não entram no baseline", calculateVersion({ ...released, tags: ["v0.1.0", "v9.0.0"] }), "0.2.0")
assert.throws(() => calculateVersion({ ...base, branch: "feature/test" }))
checks++
console.log(`\n${checks} verificações passaram, sem modificar arquivos ou publicar releases.`)
