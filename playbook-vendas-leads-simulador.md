# Playbook de Vendas — Leads do Simulador de Planejamento Patrimonial

Como abordar quem preencheu o simulador (fincarescorepatrimonial.com.br), da chegada do lead até a reunião marcada.

---

## 1. Antes de ligar: leia a linha do lead na planilha

Cada lead traz informação suficiente para *não* fazer uma abordagem genérica. Confira sempre antes de discar:

| Campo | Para que serve na abordagem |
|---|---|
| `faixa_patrimonio` / `faixa_renda` | Calibra o tom: institucional/família (5m_mais) vs. iniciante em construção (ate_500k) |
| `instituicao_financeira_atual` | Nunca criticar o banco/corretora atual — usar como gancho ("hoje você está no [X], certo?") |
| `possui_assessor` | **sim** → abordagem é de troca/segunda opinião; **não** → abordagem é de educação + primeira relação |
| `possui_gerente_banco` | Se "sim" mas `possui_assessor` = "não", o lead confunde gerente de banco com assessoria — vale explicar a diferença (banco vende produto do banco; assessor tem arquitetura aberta) |
| `objetivo_financeiro` | Usar a palavra exata do lead na abertura da ligação (aposentadoria, independência financeira, herança, etc.) |
| `perfil_investidor` (conservador/moderado/arrojado) | Não empurrar produto fora do perfil — isso é o item mais sensível do ponto de vista CVM/ANBIMA |
| `score_patrimonial` e `diagnostico_completo` | Se completou o diagnóstico avançado, ele já viu números e perguntas específicas — a ligação deve responder a isso, não repetir o simulador |
| `data` (timestamp) | Ligar dentro de até 24h; leads de simulador esfriam rápido |

A coluna **PRIORIDADE** no Sheets já ordena por temperatura (patrimônio 45% + aporte mensal 35% + 20 pts extra se `possui_assessor = não`). Trabalhe a lista de cima para baixo, não por ordem de chegada.

---

## 2. Segmentação de abordagem (por `possui_assessor`)

### A) Lead SEM assessor (`possui_assessor = não`) — maior prioridade de conversão
Objetivo da 1ª ligação: **diagnóstico gratuito**, não venda. Ele não tem termo de comparação, então o risco é parecer vendedor de produto.

Abertura sugerida:
> "Oi [nome], aqui é [seu nome] da Fincare. Vi que você simulou seu planejamento pra [objetivo_financeiro] no nosso site — queria entender melhor o que te fez buscar isso agora, e te trazer uma leitura sobre o que os números que você colocou realmente significam pro seu prazo."

### B) Lead COM assessor (`possui_assessor = sim`) — abordagem de segunda opinião
Ele já tem relação — a ligação não pode soar como "troque de assessor". Foco: comparação sem ataque.

Abertura sugerida:
> "Oi [nome], vi que você já tem assessor, então não vou tentar te convencer de nada — o simulador é justamente pra isso, uma segunda régua. Faz sentido eu te mostrar como ficou a projeção com base no que você preencheu, e você compara com o que seu assessor atual te mostra?"

---

## 3. Roteiro de ligação (5 etapas)

1. **Contexto** (15s): citar o que ele simulou, sem soar automatizado — usar `objetivo_financeiro` e `faixa_patrimonio` como referência, nunca ler valores exatos em voz alta na primeira ligação (privacidade/desconforto).
2. **Escuta** (abrir espaço): "O que te fez simular isso agora?" — deixe ele falar antes de apresentar qualquer número.
3. **Devolutiva do diagnóstico**: se `diagnostico_completo = sim`, comente o `score_patrimonial` e o `perfil_investidor` em linguagem simples ("seu perfil ficou como moderado, o que significa..."). Se `diagnostico_completo = não`, ofereça completar o diagnóstico avançado com ele por telefone/vídeo — isso já é o agendamento da reunião.
4. **Ponte para a reunião**: nunca fechar proposta de produto na ligação de qualificação. O objetivo da ligação é **marcar a reunião de diagnóstico completo**, não vender.
5. **Fechamento com data marcada**: sempre sair da ligação com dia/hora definidos, não "te mando um convite depois".

---

## 4. O que NUNCA dizer (compliance CVM/ANBIMA)

Como isso é uma frente de captação para assessoria de investimentos, cuidado redobrado na linguagem — evita passivo pessoal e institucional:

- **Nunca prometer rentabilidade** ("você vai ganhar X% ao ano") — a `rentabilidade_esperada` no simulador é premissa do próprio usuário, não promessa da Fincare.
- **Nunca dizer "garantido"** para qualquer resultado de projeção patrimonial.
- **Nunca recomendar produto específico** antes de uma análise de perfil formal (suitability) — a ligação de qualificação não substitui isso.
- **Nunca falar mal de banco/corretora concorrente** citada em `instituicao_financeira_atual`.
- Se o lead pedir recomendação de produto na primeira ligação, resposta padrão: *"isso eu só recomendo depois de entender seu perfil de investidor formalmente — é rápido, faço isso na nossa reunião."*

---

## 5. Cadência de contato (se não atender)

| Tentativa | Quando | Canal |
|---|---|---|
| 1ª | Até 1h após o lead cair na planilha (se em horário comercial) ou primeira hora útil seguinte | Ligação |
| 2ª | +4h, mesmo dia | WhatsApp curto (ver template abaixo) |
| 3ª | +1 dia útil | Ligação |
| 4ª | +3 dias úteis | WhatsApp com conteúdo de valor (não só "oi, vamos conversar?") |
| Encerramento | +7 dias sem resposta | Mover para lista de nutrição, não descartar o lead |

**Template WhatsApp (1ª tentativa sem atender):**
> "Oi [nome]! Aqui é [seu nome] da Fincare, tentei te ligar sobre o simulador de planejamento que você preencheu no site. Sem compromisso, queria te mostrar o que os números indicam pro seu objetivo de [objetivo_financeiro]. Tem 15 min essa semana?"

---

## 6. Depois da ligação: atualizar a planilha

O time comercial deve preencher manualmente uma coluna **STATUS** (novo / contatado / reunião marcada / cliente / perdido) na aba Leads — isso ainda não existe na planilha hoje e é necessário para medir taxa de conversão real por canal/prioridade (ver recomendação já registrada no Apps Script, linha ~1980). Sem isso, não dá pra saber quais campanhas do Meta Ads realmente geram cliente, só volume de lead.
