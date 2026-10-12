# Versão exibida e deploy Vercel

O rodapé global mostra **somente `vX.Y.Z`** (ou `vX.Y.Z-hmg.N` em homologação).
O JSON `lib/build-version.json` é gerado pelo Action, commitado e incorporado ao
build da Vercel, inclusive nas páginas dinâmicas. Não depende de variável em runtime e não expõe
ambiente, commit, número do workflow ou data no rodapé.

## Regras

- `main`: release estável, por exemplo `v0.1.1`.
- `hmg`: pré-release SemVer, por exemplo `v0.2.0-hmg.1`.
- `fix:` / `fix(escopo):`: PATCH.
- `feat:` / `feat(escopo):`: MINOR.
- `tipo!:`, `tipo(escopo)!:` ou rodapé `BREAKING CHANGE:`: MAJOR, inclusive em 0.x.
- `docs:`, `chore:` e commits sem essas convenções não aumentam a versão.
- Entre releases, o maior incremento encontrado ganha; não há incremento por commit.
- Squash merges precisam manter o tipo no título/mensagem do commit final.
- O primeiro release estabelece `0.1.0`, do package.json, sem contar todo o
  histórico antigo. Primeiro deploy HMG usa `0.1.0-hmg.1`.
- Tags estáveis acessíveis no histórico são o baseline dos próximos releases.
  Após promover HMG para main, sincronize main de volta em hmg para que ela
  conheça a nova versão estável e prepare o próximo ciclo.
- Docs/chore podem ser publicados com a mesma versão. Não é criada outra tag.

## GitHub Actions

`.github/workflows/release-version.yml` executa em push de `hmg`/`main` ou
manualmente nessas branches:

1. Checkout completo, validação das regras e atualização de tags.
2. Verifica se o commit ainda é o HEAD remoto; pula execuções ultrapassadas.
3. Calcula a versão por Conventional Commits e tags, sem instalar dependências.
4. Em **hmg**, commita somente o JSON e publica pré-versão/tag em push atômico.
5. Em **main**, cria uma branch `release/version-vX.Y.Z-<sha>` e abre PR contendo
   somente `lib/build-version.json`. Não faz push direto na main, merge automático,
   force-push ou bypass das proteções. Uma nova execução do mesmo commit reutiliza
   branch/PR aberto; não sobrescreve a branch nem reabre PR fechado.
6. Após revisar e fazer merge do PR de versão, o push em main executa novamente:
   se o JSON já é a versão calculada, cria a tag estável nesse commit, sem novo PR.
7. A integração Git da Vercel faz o deploy, como antes. O Action não chama a Vercel.

Um único grupo de concorrência evita numeração simultânea pelas duas branches.
Não cancelar um release em andamento. GitHub pode substituir execuções pendentes
por pushes mais novos; o cálculo considera todos os commits desde o baseline.
O commit automático de **hmg** é ignorado para não gerar ciclos; **main** executa
também no merge da versão para registrar a tag estável. Não usa
`[skip ci]`, pois isso também poderia impedir o deploy Git da Vercel. O push usa
o `GITHUB_TOKEN` nativo do Actions, sem secrets adicionais da Vercel.

Tags registram a versão do código, **não comprovam sucesso do deploy**. O Action
não acompanha o resultado da Vercel. Se o deploy falhar, corrigir/republicar pela
integração Git. Se o push atômico falhar por branch ter avançado, a execução do
commit mais recente irá recalcular; se for proteção/permissão, regularizar antes
de executar novamente. Nenhum histórico é sobrescrito. Se main avançar enquanto
um PR de versão está aberto, conferir se ele ainda traz a versão mais recente;
fechar PRs obsoletos pelo fluxo normal de revisão.
Tags `v*` são reservadas a este workflow; não criar/excluir tags manualmente.

## Deploy original pela integração Git

Não são necessários `VERCEL_TOKEN`, `VERCEL_ORG_ID` ou `VERCEL_PROJECT_ID` no
Action. Os secrets antigos, se cadastrados, não são usados. O workflow precisa
de permissões `contents: write` e `pull-requests: write` do GitHub Actions para
atualizar hmg/criar branches e tags e abrir o PR de versão de main.

Em **Settings → Actions → General → Workflow permissions**, habilitar
**Allow GitHub Actions to create and approve pull requests**. Essa configuração
é necessária para a API aceitar a criação do PR pelo GITHUB_TOKEN. O workflow
não aprova nem faz merge de PRs. Essa opção foi habilitada em 12/10/2026 com
autorização do usuário, mantendo a permissão padrão dos workflows como read. Manter a proteção
da main exigindo PR e respeitar as regras de revisão/checks.

Na Vercel:

- Manter a integração Git conectada e a configuração de branches/domínios existente.
- Definir `NEXT_PUBLIC_NEW_API_URL` correto em Production e Preview para `hmg`.
- Não cadastrar `NEXT_PUBLIC_DEV_TOKEN` em deploys; é exclusivo do desenvolvimento local.
- Conferir domínios de produção e o domínio/alias de homologação no projeto.
- O `vercel.json` que desativava deploys Git automáticos foi removido. Não há
  bloqueio do deploy Git automático por esta implementação.
- Um push de código pode gerar um deploy com a versão anterior e, quando houver
  nova versão, outro deploy do commit gerado pelo Action. O último incorpora a
  versão correta. Esse comportamento preserva a integração Git sem orquestrar
  deploys por CLI nem exigir credenciais externas.

O código local não altera configurações remotas. Nenhum deploy/tag/push é feito
simplesmente por executar o build local.

## Uso local e verificação

```sh
node scripts/check-release-version.mjs
# Opcional: regenerar a versão local a partir do histórico da branch atual
node scripts/release-version.mjs hmg
```

O gerador escreve `lib/build-version.json`; o Action commita somente esse arquivo.
No desenvolvimento local, rodar o gerador não faz commit/push. Previews Git de
outras branches não participam do versionamento automático e usam a versão
presente no código.
