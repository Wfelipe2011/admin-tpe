// Dupla com homem e mulher no mesmo ponto: é permitido, só sinalizamos ao capitão
// ("Tem certeza que vai manter assim?") — nunca bloqueia.

// Trecho da mensagem que a legacy põe em `assignment.error` quando a dupla é mista.
// Como agora é só um aviso, esse erro vermelho não deve aparecer no card.
export const LEGACY_GENDER_ERROR_FRAGMENT = "sexos diferentes"

const PREPOSITIONS = ["de", "da", "do", "das", "dos", "e"]

// sobrenomes = tudo depois do primeiro nome, sem preposições (mesma regra da legacy)
function surnames(fullName: string): string[] {
  return fullName
    .trim()
    .split(" ")
    .map((part) => part.toLowerCase())
    .filter((part) => part.length > 0 && !PREPOSITIONS.includes(part))
    .slice(1)
}

// Casal (mesmo sobrenome) sempre foi aceito, então não vira aviso.
function shareSurname(a: string, b: string): boolean {
  const other = surnames(b)
  return surnames(a).some((s) => other.includes(s))
}

interface PairMember {
  id: string
  name: string
  sex?: string
}

export function isMixedSexPair(participants: PairMember[]): boolean {
  if (participants.length !== 2) return false
  const [a, b] = participants
  if (!a.sex || !b.sex || a.sex === b.sex) return false
  return !shareSurname(a.name, b.name)
}

/** Chave estável da dupla, pra lembrar que o capitão já confirmou "manter assim". */
export function pairKey(participants: PairMember[]): string {
  return participants
    .map((p) => p.id)
    .sort()
    .join("-")
}
