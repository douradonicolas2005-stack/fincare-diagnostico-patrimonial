# Plano — internalizar o "melhor do systeme.io" no stack Fincare

Objetivo: pegar as capacidades boas do systeme.io e implementá-las **dentro do
stack que já existe** (Next.js/Vercel + Sheets + fincare-prospeccao + Atlas +
Notion), sem adotar mais um SaaS de CRM/funil e sem duplicar dado. Foco em
**alto valor / baixo atrito**, já que a operação está em validação solo.

## Arquitetura atual (ponto de partida real)

- **App:** Next.js 15 (App Router), Vercel, validação `zod`, `@vercel/analytics`.
- **Captura de lead:** `app/api/leads/route.ts` → `forwardLead()`
  (`lib/server/integrations.ts`) envia para **Google Sheets** (Apps Script,
  `google-sheets-integration.gs`) + **Formspree** (redundante) + **Meta CAPI**
  (`lib/server/meta-capi.ts`).
- **Eventos de funil:** `app/api/funnel/route.ts` → Sheets (`tipo: "funil"`).
- **Schema do lead:** `lib/security.ts:leadSchema` já tem `nome`, `email`,
  `telefone`, `cidade/estado`, `instituicao_financeira_atual`,
  `objetivo_financeiro`, `perfil_investidor*`, **consentimento** (`consentimento_contato`
  + `consentimento_data_hora`) e **UTM** (`utm_source/medium/campaign/content/term`).
- **Sem banco:** o **Google Sheets é a fonte de verdade** dos leads. Qualquer
  estado novo (ex.: "e-mail de nurture já enviado") precisa morar em algum lugar
  — ver decisão em §2.

Princípio herdado do blueprint Notion: **não duplicar CRM.** Sheets/Atlas/Notion
continuam donos do lead; as peças abaixo são camadas em cima, não um CRM novo.

---

## 1. Rastreio de indicação (`?ref=`) — 🔥 começar por aqui (baixo atrito)

**O que o systeme.io faz:** link de afiliado rastreável.
**No seu stack:** já existe captura de UTM — basta adicionar `ref`.

**Passos:**
1. `lib/security.ts` → adicionar ao `leadSchema` (e ao `funnelSchema`):
   `ref: z.string().trim().max(120).optional()` (quem indicou).
2. Onde a UI lê os parâmetros de URL para UTM (client), ler também `?ref=` e
   persistir junto (mesma sessionStorage/cookie dos UTMs) para sobreviver à
   navegação até o envio do lead.
3. Incluir `ref` no payload que vai pro `forwardLead` → o Sheets ganha a coluna.
4. `google-sheets-integration.gs` → mapear a nova coluna `ref` (mesmo padrão das
   colunas de UTM; escapar fórmula, como já é feito em texto auto-declarado).
5. No Notion, a database **Conectores & Indicações** passa a cruzar por `ref`.

**Esforço:** baixo (1 campo ponta a ponta).
**Compliance:** ⚠️ rastrear indicação é ok; **remunerar** indicação de cliente em
assessoria tem implicação regulatória (CVM) — rastrear ≠ pagar. Não montar
"programa de afiliados pago" sem parecer.

---

## 2. Nurture morno por e-mail (Resend + Vercel Cron) — valor alto, esforço médio

**O que o systeme.io faz:** sequência de e-mails automática (abriu/clicou/comprou).
**Gap real seu:** o forte hoje é o **frio** (Instantly, `fincare-prospeccao`);
falta **aquecer quem baixou o simulador**.

**Design recomendado (nativo Vercel):**
- **Envio:** **Resend** (`RESEND_API_KEY`), domínio de envio
  `fincarescorepatrimonial.com.br` com SPF/DKIM — resolve a dor de SMTP/Gmail e
  o bloqueio do Microsoft Graph registrados no ecossistema.
- **Gatilho:** **Vercel Cron** (`vercel.json`) chamando `app/api/nurture/tick`
  1x/dia. O tick decide quem recebe D0/D3/D7 a partir de
  `consentimento_data_hora` do lead — reaproveitando a lógica de cadência D0/D7
  que já existe em `fincare-prospeccao/src/outreach.py` (portar as regras, não
  o código).
- **Estado ("quais e-mails já enviei"):** ver decisão abaixo.

**Decisão pendente — onde guardar o estado do nurture:**
| Opção | Prós | Contras |
|---|---|---|
| **Vercel KV / Upstash Redis** (recomendado) | trivial no Vercel, rápido | +1 dependência |
| Colunas no próprio **Sheet** (`nurture_d0_sent`…) | zero dependência nova | Sheet vira "banco", mais frágil/lento |
| **Apps Script** com time-trigger enviando via Gmail | tudo no Sheet | limites do Gmail, entregabilidade pior, sem Resend |

**Passos (com KV):**
1. `app/api/nurture/tick/route.ts` — lê leads elegíveis (consent=true), calcula
   o passo devido por `data`/`consentimento_data_hora`, envia via Resend, grava
   `sent:{email}:{step}` no KV (idempotente — não reenvia).
2. `vercel.json` → `{ "crons": [{ "path": "/api/nurture/tick", "schedule": "0 12 * * *" }] }`.
3. Proteger o endpoint (cron secret / header do Vercel Cron).
4. Copy dos e-mails D0/D3/D7 = entregável separado (mirar médico/empresário).

**Compliance (obrigatório):**
- Só enviar para `consentimento_contato === true` (já garantido no schema).
- **Link de descadastro** em todo e-mail + honrar opt-out (mesma lista de
  supressão que o `fincare-prospeccao` já usa).
- **Sem promessa de rentabilidade**; educar, não recomendar produto.

**Esforço:** médio.

---

## 3. Agendamento (Cal.com) — valor alto, esforço baixo-médio

**O que o systeme.io faz:** calendário de agendamento nativo.
**No seu stack:** resolve a decisão de "qual agenda" que ficou pendente no
Atlas/CRM, sem escolher Google vs Outlook agora (Cal.com conecta os dois depois).

**Design:**
- **Cal.com** (open-source, plano free) — embed na página de resultado do
  diagnóstico (`app/diagnostico/page.tsx`) e/ou rota dedicada `app/agendar`.
- Usar `@calcom/embed-react` (ou script inline) e **pré-preencher nome/e-mail**
  do lead quando já capturado.
- **Webhook** Cal.com (`booking.created`) → `app/api/booking/route.ts` →
  encaminha pro Sheets/Notion **Pipeline** (etapa → *3 1ª Reunião*) e opcional
  Atlas `Contato`, gravando `data_proximo_contato`.

**Passos:**
1. Criar evento no Cal.com ("Diagnóstico patrimonial — 30 min", 2 janelas/dia).
2. Embed na tela de resultado + CTA "agendar diagnóstico".
3. `app/api/booking/route.ts` valida `CAL_WEBHOOK_SECRET` e reencaminha (mesmo
   padrão de `forwardLead`).
4. Refletir no Pipeline/Atlas.

**Esforço:** baixo-médio.

---

## Ordem de implementação sugerida
1. **`?ref=`** (rápido, destrava o canal de indicação).
2. **Cal.com** (tira "marcar reunião" do limbo).
3. **Nurture Resend + Cron** (maior peça; precisa da decisão de estado em §2 e do copy).

## Não fazer agora (deliberado)
- **Área de membros / curso** e **webinar automatizado** — só quando houver
  conteúdo gravado. Até lá, se necessário, usar o **systeme.io Free** só pra
  essas duas peças (híbrido), sem tocar no núcleo. Reaproveitar o padrão de auth
  por cookie HMAC do frontend do Atlas quando for internalizar a área de membros.

## Variáveis de ambiente novas (quando implementar)
```
RESEND_API_KEY=
NURTURE_CRON_SECRET=
KV_REST_API_URL=            # se optar por Vercel KV/Upstash
KV_REST_API_TOKEN=
CAL_WEBHOOK_SECRET=
NEXT_PUBLIC_CAL_LINK=       # ex.: nicolasdourado/diagnostico
```
