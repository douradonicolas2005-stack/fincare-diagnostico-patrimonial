# Relatório de análise de segurança

Data da análise: 21/07/2026

## Escopo

Foram analisados os arquivos HTML, o Google Apps Script, o arquivo `.zip`, referências históricas do Git e as integrações configuradas no código. A exposição pública do repositório não foi considerada como achado, conforme solicitado.

## Conclusão

O projeto não deve operar com dados reais antes da correção do webhook do Google Apps Script. O frontend expõe uma rota que pode gravar dados na planilha e disparar e-mails usando uma chave disponível no próprio navegador.

## Achados prioritários

| Severidade | Achado                                                | Evidência                                                    |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| Crítica    | Token do Apps Script exposto no frontend              | `fincare-diagnostico-patrimonial-inteligente.html:1426-1434` |
| Crítica    | Endpoint aceita chamadas externas e grava na planilha | `google-sheets-integration.gs:159-233`                       |
| Alta       | Possível spam, poluição da base e abuso de e-mails    | `google-sheets-integration.gs:243-250`                       |
| Alta       | Possível formula injection no Google Sheets           | `google-sheets-integration.gs:224-233`                       |
| Alta       | Dados financeiros e PII enviados a terceiros          | Formspree, Google Sheets, Meta Pixel e e-mail                |
| Média      | HTML não sanitizado em e-mails e PDFs                 | `google-sheets-integration.gs:329-579`                       |
| Média      | Ausência de CSP e headers de segurança no projeto     | Todos os HTML                                                |
| Média      | Meta Pixel executado antes do consentimento           | `fincare-diagnostico-patrimonial-inteligente.html:30-46`     |
| Média      | Política de privacidade ainda é um texto-modelo       | `privacidade.html:46-48`                                     |

## 1. Token e autenticação do Apps Script

O mesmo token está no HTML e no Apps Script (`fincare-diagnostico-patrimonial-inteligente.html:1434` e `google-sheets-integration.gs:123`). Como o valor é entregue ao navegador, qualquer visitante pode obtê-lo.

Um atacante pode usar o endpoint para:

- inserir leads falsos na planilha;
- poluir ou lotar a base;
- disparar e-mails para endereços arbitrários;
- consumir cotas do Google Apps Script/MailApp;
- inserir dados maliciosos em relatórios e fórmulas;
- enviar eventos falsos para a aba `Funil`.

O token não deve ser tratado como segredo válido. A correção recomendada é remover a chamada direta do browser para o Apps Script e usar uma API server-side. Credenciais e tokens devem ficar somente em variáveis de ambiente do backend.

Como mitigação temporária, deve-se trocar o token atual, limitar payloads, validar campos, aplicar rate limit por IP/sessão/e-mail, limitar eventos de funil e impedir disparos de e-mail baseados em payload não verificado.

## 2. Formula injection no Google Sheets

O Apps Script copia valores controlados pelo usuário para a planilha sem neutralizar prefixos de fórmula:

```javascript
var v = data[h];
sheet.getRange(novaLinha, 1, 1, row.length).setValues([row]);
```

Campos textuais como nome, instituição, cidade e UTMs podem começar com `=`, `+`, `-` ou `@` e devem ser tratados antes de `setValues()`.

## 3. Abuso de envio de e-mails

O Apps Script envia um PDF para o e-mail recebido no payload. A validação atual verifica apenas um formato básico. O rate limit é por e-mail e pode ser contornado usando endereços diferentes; eventos de funil não passam pelo mesmo controle.

Recomendações: CAPTCHA/Turnstile, rate limit por IP e sessão, nonce de curta duração, deduplicação, limite global de envios, registro de recusas e validação de tamanho e conteúdo.

## 4. HTML injection em e-mails e PDFs

O Apps Script concatena dados externos diretamente em HTML. Isso ocorre no nome, perfil, alocação e conteúdo do PDF/e-mail. Um payload direto pode alterar o layout, inserir links de phishing ou produzir HTML malicioso em clientes de e-mail que não sanitizem corretamente.

Deve existir uma função de escape HTML e listas permitidas para perfil, objetivo, estado e classes de alocação. Dados de entrada nunca devem ser concatenados diretamente em HTML.

## 5. Dados sensíveis e integrações

O simulador coleta nome, e-mail, telefone, localização, patrimônio, aporte, renda, instituição financeira, objetivos e informações patrimoniais. Esses dados são enviados ao Google Sheets, Formspree e e-mail com PDF. O Meta Pixel também é inicializado no carregamento.

Recomendações:

- centralizar integrações em backend;
- documentar operadores e subprocessadores;
- definir retenção e exclusão;
- restringir acesso à planilha;
- separar marketing de dados patrimoniais;
- evitar enviar carteira completa por e-mail;
- revisar a política com jurídico/compliance.

## 6. Meta Pixel e consentimento

O Pixel dispara `PageView` antes da autorização de contato. Deve ser avaliado o carregamento somente após consentimento apropriado, ou deve ser formalmente definida a base legal e a política de cookies. O histórico do Git também contém um identificador real de Pixel; ele não é uma senha, mas deve ser revisado no painel da Meta.

## 7. Headers de segurança

Não foram encontrados CSP, `frame-ancestors`, `Permissions-Policy` ou configuração de headers no projeto. Recomenda-se configurar no servidor/CDN:

```http
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

A CSP deverá ser adaptada porque o projeto usa scripts inline e handlers como `onclick`.

## 8. Upload e Open Finance

O upload de PDF/XLS/CSV atualmente é apenas visual; os leitores não estão implementados e nenhum arquivo é enviado. Isso é positivo no estado atual.

Se implementado, o fluxo deve usar backend, validar MIME e tamanho, renomear arquivos, remover metadados, usar armazenamento temporário com expiração, bloquear macros e executar antivírus/sandbox.

O `.zip` contém um módulo histórico de Open Finance com placeholders, sem credenciais reais. O frontend não deve manipular tokens OAuth ou refresh tokens. A integração futura deve usar Authorization Code + PKCE, `state`/`nonce`, cookies `HttpOnly`, `Secure`, `SameSite` e backend responsável pelos tokens.

## O que não foi encontrado

Não foram encontrados tokens AWS, chaves Google API, chaves privadas, senhas, credenciais de banco, Firebase/Supabase, armazenamento de dados sensíveis em `localStorage`, chamadas reais de Open Finance ou leitura efetiva dos arquivos enviados.

Não há XSS direto evidente no fluxo normal do navegador: os `innerHTML` do frontend usam principalmente valores numéricos ou constantes controladas. O maior risco de HTML injection está no Apps Script, que aceita payload arbitrário pela internet.

## Modularização recomendada

Para o objetivo atual, Alpine.js via CDN é a opção mais simples, pois combina com HTML existente e exige pouca infraestrutura. Vue 3 continua sendo uma boa opção, mas faz mais sentido se o dashboard crescer, houver muitos componentes, gráficos, edição de carteira ou migração posterior para Vite/TypeScript.

Estrutura sugerida:

```text
index.html
privacidade.html
assets/
  css/app.css
  js/
    state.js
    calculator.js
    validation.js
    telemetry.js
    ui.js
api/
  leads
```

Para uma evolução maior:

```text
src/
  components/
  domain/calculator.ts
  domain/investorProfile.ts
  domain/validation.ts
  integrations/leadApi.ts
  integrations/analytics.ts
  stores/simulatorStore.ts
  security/sanitization.ts
```

Fluxo profissional recomendado:

```text
Browser -> /api/leads -> validação/rate limit/CAPTCHA -> Sheets/CRM/e-mail
```

Nenhuma chave de CRM, Google, e-mail ou provedor deve aparecer no HTML ou JavaScript entregue ao cliente.

## Ordem de correção

1. Remover o Apps Script direto do navegador.
2. Revogar/trocar o token atual e revisar o histórico do Git.
3. Neutralizar fórmulas antes de gravar no Sheets.
4. Colocar validação, rate limit e CAPTCHA no backend.
5. Sanitizar dados usados em e-mails e PDFs.
6. Revisar consentimento, cookies e Meta Pixel.
7. Restringir acesso e definir retenção da planilha.
8. Adicionar headers de segurança.
9. Separar/remover o `.zip` e módulos históricos do pacote de produção.
10. Modularizar o frontend, começando por Alpine.js.

## Status

Risco alto para operação com dados reais. O simulador pode ser usado como protótipo sem coleta, mas a coleta de leads e dados patrimoniais deve permanecer desativada até a correção do webhook e do armazenamento.
