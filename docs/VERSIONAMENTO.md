# Versão exibida e deploy Vercel

O rodapé global mostra **somente `vX.Y.Z`** (ou `vX.Y.Z-hmg.N` em homologação).
O JSON `lib/build-version.json` é gerado antes do build e incorporado ao artefato,
inclusive nas páginas dinâmicas. Não depende de variável em runtime e não expõe
ambiente, commit, número do workflow ou data no rodapé.

## Regras

- `master`: release estável, por exemplo `v0.1.1`.
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
  Após promover HMG para master, sincronize master de volta em hmg para que ela
  conheça a nova versão estável e prepare o próximo ciclo.
- Docs/chore podem ser publicados com a mesma versão. Não é criada outra tag.

## GitHub Actions

`.github/workflows/release-vercel.yml` executa em push de `hmg`/`master` ou
manualmente nessas branches:

1. Checkout completo e atualização de tags.
2. Instalação com pnpm 9.15.9 e lockfile congelado; validação das regras.
3. Cálculo da versão por Conventional Commits e tags, sem commit automático.
4. `vercel pull` do ambiente/branch correto, seguido de `vercel build`.
5. `vercel deploy --prebuilt` do mesmo artefato, com `--prod` apenas em master.
6. Tag anotada `v<versão>` no commit publicado, somente após deploy bem-sucedido.

Um único grupo de concorrência evita numeração simultânea pelas duas branches.
Não cancelar um release em andamento. GitHub pode substituir execuções pendentes
por pushes mais novos; o cálculo considera todos os commits desde o baseline.
Build/deploy com falha não cria tag. Se o deploy passar mas o push da tag falhar,
regularize a permissão e execute novamente no mesmo commit antes do próximo release.
Tags `v*` são reservadas a este workflow; não criar/excluir tags manualmente.

## Configuração obrigatória antes de ativar

No GitHub do **admin-tpe**, cadastrar os secrets:

- `VERCEL_TOKEN`: token com acesso ao projeto.
- `VERCEL_ORG_ID`: ID da conta/time.
- `VERCEL_PROJECT_ID`: ID do projeto existente.

Os dois IDs podem ser obtidos em `.vercel/project.json` após vincular o projeto
ou no painel da Vercel. Não commitar tokens nem a pasta `.vercel`.

O workflow usa GitHub Environments **production** e **hmg**. Podem ter secrets
próprios (inclusive IDs de projetos diferentes), revisores e proteção. O token
do GitHub Actions precisa de `contents: write` e permissão para criar tags `v*`.

Na Vercel:

- Production Branch deve ser `master` se ambas as branches usam o mesmo projeto.
- Definir `NEXT_PUBLIC_NEW_API_URL` correto em Production e Preview para `hmg`.
- Não cadastrar `NEXT_PUBLIC_DEV_TOKEN` em deploys; é exclusivo do desenvolvimento local.
- Conferir domínios de produção e o domínio/alias de homologação no projeto.
- `vercel.json` desativa o deploy Git automático **somente para hmg e master**,
  evitando dois deployments e a publicação antes de gerar a versão. Outras
  branches mantêm previews automáticos, com a versão fallback do JSON no repo.
- Cadastrar os secrets e conferir esse fluxo **antes** de publicar o vercel.json,
  para não interromper deployments automáticos sem substituição funcional.

O código local não altera configurações remotas. Nenhum deploy/tag/push é feito
simplesmente por executar o build local.

## Uso local e verificação

```sh
node scripts/check-release-version.mjs
# Opcional: regenerar a versão local a partir do histórico da branch atual
node scripts/release-version.mjs hmg
```

O gerador escreve `lib/build-version.json`; o Action não commita esse resultado.
O arquivo versionado é o fallback local. Para builds da Vercel via CLI, sempre
executar o gerador antes de `vercel build`; previews Git de outras branches não
participam do versionamento automático.
