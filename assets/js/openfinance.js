/**
 * ============================================================================
 * FINCARE INVESTIMENTOS | SAFRA INVEST — MÓDULO OPEN FINANCE
 * ============================================================================
 *
 * Arquivo: /assets/js/openfinance.js
 *
 * Este módulo NÃO simula, NÃO inventa e NÃO preenche nenhum dado financeiro.
 * Ele existe apenas para deixar a arquitetura pronta para, no futuro, se
 * conectar a um backend real de Open Finance (Open Finance Brasil).
 *
 * Enquanto o backend não existir (OPEN_FINANCE_CONFIG.backendBaseUrl vazio),
 * todo método de OpenFinanceService rejeita a Promise com um erro controlado
 * (OpenFinanceNotConfiguredError). Nenhuma função aqui retorna número, saldo,
 * ativo ou instituição fictícios — apenas dados que vierem de fato da API.
 *
 * Quando o backend estiver disponível, basta preencher OPEN_FINANCE_CONFIG
 * abaixo. Nenhuma outra parte do código (HTML/CSS/JS da calculadora) precisa
 * ser refatorada: os métodos já fazem chamadas REST reais e já devolvem os
 * dados no formato dos typedefs declarados neste arquivo.
 *
 * Segurança / decisões de arquitetura:
 * - Este módulo NUNCA solicita, recebe ou armazena credenciais bancárias.
 * - Este módulo NUNCA guarda tokens de acesso em localStorage/sessionStorage
 *   ou em variáveis expostas globalmente. Toda chamada usa `credentials:
 *   'include'`, isto é, depende de um cookie de sessão HttpOnly emitido pelo
 *   PRÓPRIO BACKEND da Fincare — o navegador nunca manipula o token OAuth2 /
 *   OpenID Connect emitido pela instituição financeira ou pelo agregador
 *   (Belvo / Pluggy / Celcoin). O backend é quem troca, guarda e renova
 *   (refresh token) esse token; o front-end só conversa com o backend.
 * - A autorização (OAuth2 + OpenID Connect) e o consentimento (Open Finance
 *   Brasil) acontecem inteiramente no domínio da instituição financeira e/ou
 *   do backend da Fincare, nunca dentro deste arquivo.
 * ============================================================================
 */

(function (global) {
  'use strict';

  /* ==========================================================================
   * CONFIGURAÇÃO
   * ==========================================================================
   * Preencher quando o backend de Open Finance existir. Até lá, o serviço
   * inteiro permanece em modo "não configurado" e nunca inventa dados.
   * ========================================================================== */
  const OPEN_FINANCE_CONFIG = {
    // Base da API REST do backend da Fincare que fará a ponte com o Open
    // Finance Brasil (diretamente ou via agregador). Ex.: 'https://api.fincare.com.br/openfinance'
    backendBaseUrl: '',

    // Endpoint OpenID Connect / OAuth2 de descoberta do backend (RFC 8414),
    // usado pelo backend para orquestrar o Authorization Code Flow com a
    // instituição financeira. O front-end nunca fala diretamente com o IdP.
    oidcDiscoveryUrl: '',

    // Identificador do client OAuth2 registrado no Diretório de Participantes
    // do Open Finance Brasil (preenchido pelo backend/infra, não pelo front-end).
    oauthClientId: '',

    // URI de retorno após autorização, deve apontar para uma rota do backend
    // (não para este HTML), que finaliza o Authorization Code Flow e cria a
    // sessão autenticada (cookie HttpOnly) antes de redirecionar de volta.
    redirectUri: '',

    // Provedor/agregador de Open Finance por trás do backend. Nenhuma chamada
    // é feita diretamente a esses provedores a partir do navegador — servem
    // apenas para o backend saber qual integração orquestrar.
    // Valores possíveis quando configurado: 'belvo' | 'pluggy' | 'celcoin' | 'direto'
    provider: null,

    // Tempo máximo (ms) que o front-end aguarda uma resposta do backend
    // antes de reportar erro de comunicação.
    requestTimeoutMs: 15000
  };

  function isConfigured() {
    return Boolean(OPEN_FINANCE_CONFIG.backendBaseUrl);
  }

  /* ==========================================================================
   * ERROS CONTROLADOS
   * ==========================================================================
   * Cada situação prevista tem uma classe própria, com um `code` estável
   * (para lógica) e uma `userMessage` (para exibição). Nunca lançamos um
   * erro genérico sem explicar o que aconteceu.
   * ========================================================================== */
  class OpenFinanceError extends Error {
    constructor(code, userMessage, cause) {
      super(userMessage);
      this.name = 'OpenFinanceError';
      this.code = code;
      this.userMessage = userMessage;
      if (cause) this.cause = cause;
    }
  }

  class OpenFinanceNotConfiguredError extends OpenFinanceError {
    constructor() {
      super(
        'NOT_CONFIGURED',
        'Esta funcionalidade será habilitada quando a integração com Open Finance estiver configurada.'
      );
      this.name = 'OpenFinanceNotConfiguredError';
    }
  }

  class OpenFinanceConsentDeniedError extends OpenFinanceError {
    constructor(cause) {
      super(
        'CONSENT_DENIED',
        'Você cancelou a autorização com a sua instituição financeira. Nenhum dado foi compartilhado.',
        cause
      );
      this.name = 'OpenFinanceConsentDeniedError';
    }
  }

  class OpenFinanceInstitutionUnavailableError extends OpenFinanceError {
    constructor(institutionName, cause) {
      super(
        'INSTITUTION_UNAVAILABLE',
        (institutionName ? 'A instituição "' + institutionName + '"' : 'Sua instituição financeira') +
          ' está temporariamente indisponível para conexão via Open Finance. Tente novamente em alguns minutos.',
        cause
      );
      this.name = 'OpenFinanceInstitutionUnavailableError';
    }
  }

  class OpenFinanceTokenExpiredError extends OpenFinanceError {
    constructor(cause) {
      super(
        'TOKEN_EXPIRED',
        'Sua sessão com o Open Finance expirou. Conecte novamente para atualizar os dados.',
        cause
      );
      this.name = 'OpenFinanceTokenExpiredError';
    }
  }

  class OpenFinanceCommunicationError extends OpenFinanceError {
    constructor(cause) {
      super(
        'COMMUNICATION_ERROR',
        'Não foi possível se comunicar com o serviço de Open Finance agora. Verifique sua conexão e tente novamente.',
        cause
      );
      this.name = 'OpenFinanceCommunicationError';
    }
  }

  class OpenFinanceDataUnavailableError extends OpenFinanceError {
    constructor(cause) {
      super(
        'DATA_UNAVAILABLE',
        'Sua instituição financeira ainda não retornou os dados solicitados. Tente novamente em instantes.',
        cause
      );
      this.name = 'OpenFinanceDataUnavailableError';
    }
  }

  /* ==========================================================================
   * ESTRUTURAS DE DADOS (typedefs)
   * ==========================================================================
   * Nenhum destes tipos é instanciado com valores neste arquivo. Servem para
   * documentar o formato exato que a API deverá devolver, e que os
   * componentes de dashboard (no HTML principal) já sabem consumir.
   * ========================================================================== */

  /**
   * @typedef {Object} FinancialInstitution
   * @property {string} id                 Identificador do participante no Diretório Open Finance
   * @property {string} name
   * @property {string} [logoUrl]
   */

  /**
   * @typedef {Object} Account
   * @property {string} id
   * @property {string} institutionId
   * @property {string} institutionName
   * @property {'CONTA_CORRENTE'|'CONTA_POUPANCA'|'CONTA_INVESTIMENTO'|'CONTA_PAGAMENTO'} type
   * @property {string} currency
   */

  /**
   * @typedef {Object} Balance
   * @property {string} accountId
   * @property {number} availableAmount
   * @property {number} blockedAmount
   * @property {string} currency
   * @property {string} referenceDate  ISO 8601
   */

  /**
   * @typedef {Object} FixedIncomeInvestment
   * @property {string} id
   * @property {string} accountId
   * @property {string} issuer
   * @property {'CDB'|'LCI'|'LCA'|'TESOURO_DIRETO'|'DEBENTURE'|'OUTRO'} kind
   * @property {number} grossAmount
   * @property {string} maturityDate
   */

  /**
   * @typedef {Object} EquityInvestment
   * @property {string} id
   * @property {string} accountId
   * @property {string} ticker
   * @property {'ACAO'|'FII'|'ETF'|'BDR'} kind
   * @property {number} quantity
   * @property {number} currentPrice
   * @property {number} grossAmount
   */

  /**
   * @typedef {Object} FundInvestment
   * @property {string} id
   * @property {string} accountId
   * @property {string} fundName
   * @property {string} cnpj
   * @property {number} quotaAmount
   * @property {number} grossAmount
   */

  /**
   * @typedef {Object} PensionInvestment
   * @property {string} id
   * @property {string} accountId
   * @property {'PGBL'|'VGBL'} kind
   * @property {number} grossAmount
   */

  /**
   * @typedef {Object} CreditCard
   * @property {string} id
   * @property {string} institutionName
   * @property {number} currentInvoiceAmount
   * @property {number} availableLimit
   */

  /**
   * @typedef {Object} Loan
   * @property {string} id
   * @property {string} institutionName
   * @property {number} outstandingBalance
   * @property {number} monthlyInstallment
   */

  /**
   * @typedef {Object} Financing
   * @property {string} id
   * @property {string} institutionName
   * @property {number} outstandingBalance
   * @property {number} monthlyInstallment
   */

  /**
   * @typedef {Object} CashFlowEntry
   * @property {string} accountId
   * @property {string} date  ISO 8601
   * @property {number} amount
   * @property {'CREDITO'|'DEBITO'} direction
   * @property {string} description
   */

  /**
   * @typedef {Object} ConsolidatedPosition
   * Formato agregado que o backend deverá devolver (ou que o front-end monta
   * a partir das chamadas individuais) para alimentar o Dashboard Patrimonial.
   * @property {Account[]} accounts
   * @property {Balance[]} balances
   * @property {(FixedIncomeInvestment|EquityInvestment|FundInvestment|PensionInvestment)[]} investments
   * @property {CreditCard[]} cards
   * @property {Loan[]} loans
   * @property {Financing[]} financings
   * @property {CashFlowEntry[]} cashFlow
   * @property {string} retrievedAt ISO 8601
   */

  /* ==========================================================================
   * CLIENTE HTTP INTERNO
   * ==========================================================================
   * Centraliza toda chamada ao backend e traduz falhas de rede/HTTP em erros
   * controlados. Usa cookies de sessão (HttpOnly) — nunca lê ou grava tokens
   * via JavaScript.
   * ========================================================================== */
  async function request(path, options) {
    if (!isConfigured()) {
      throw new OpenFinanceNotConfiguredError();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPEN_FINANCE_CONFIG.requestTimeoutMs);

    let response;
    try {
      response = await fetch(OPEN_FINANCE_CONFIG.backendBaseUrl + path, Object.assign(
        {
          credentials: 'include', // sessão HttpOnly emitida pelo backend — nunca um token manipulado aqui
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        },
        options || {}
      ));
    } catch (networkError) {
      throw new OpenFinanceCommunicationError(networkError);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401) {
      throw new OpenFinanceTokenExpiredError();
    }
    if (response.status === 403) {
      throw new OpenFinanceConsentDeniedError();
    }
    if (response.status === 503 || response.status === 502) {
      throw new OpenFinanceInstitutionUnavailableError();
    }
    if (response.status === 204) {
      throw new OpenFinanceDataUnavailableError();
    }
    if (!response.ok) {
      throw new OpenFinanceCommunicationError(new Error('HTTP ' + response.status));
    }

    try {
      return await response.json();
    } catch (parseError) {
      throw new OpenFinanceDataUnavailableError(parseError);
    }
  }

  /* ==========================================================================
   * OpenFinanceService
   * ==========================================================================
   * Ponto único de acesso do front-end ao Open Finance. Nenhum método aqui
   * retorna dado inventado — ou o backend responde de verdade, ou a Promise
   * é rejeitada com um dos erros controlados acima.
   * ========================================================================== */
  const OpenFinanceService = {
    /**
     * Indica se este front-end está apontando para um backend real.
     * A interface deve usar isto para decidir se mostra a funcionalidade
     * como disponível ou como "em preparação".
     */
    isConfigured,

    /**
     * @returns {{connected: boolean, institution: FinancialInstitution|null, consentExpiresAt: string|null}}
     * Consulta o backend se já existe uma sessão/consentimento ativo.
     * Nunca retorna dados fictícios: sem backend, o próprio estado
     * "connected: false" é a verdade.
     */
    async getConnectionStatus() {
      if (!isConfigured()) {
        return { connected: false, institution: null, consentExpiresAt: null };
      }
      return request('/status', { method: 'GET' });
    },

    /**
     * Fluxo completo de conexão: autoriza + solicita consentimento.
     * Sem backend configurado, rejeita imediatamente com
     * OpenFinanceNotConfiguredError — nunca simula sucesso.
     * @param {string} institutionId
     */
    async connect(institutionId) {
      if (!isConfigured()) {
        throw new OpenFinanceNotConfiguredError();
      }
      await this.authorize(institutionId);
      return this.requestConsent();
    },

    /**
     * Inicia o Authorization Code Flow (OAuth2 + OpenID Connect) delegando
     * ao backend, que sabe o client_id, o redirect_uri e o discovery
     * document do Open Finance Brasil. O front-end nunca monta a URL de
     * autorização nem manipula o `code`/token retornado.
     * @param {string} institutionId
     */
    async authorize(institutionId) {
      if (!isConfigured()) {
        throw new OpenFinanceNotConfiguredError();
      }
      return request('/authorize', {
        method: 'POST',
        body: JSON.stringify({ institutionId })
      });
    },

    /**
     * Solicita/confirma o consentimento (escopos de dados autorizados pelo
     * usuário) junto ao backend, conforme o padrão Open Finance Brasil.
     * @param {string[]} [scopes]
     */
    async requestConsent(scopes) {
      if (!isConfigured()) {
        throw new OpenFinanceNotConfiguredError();
      }
      return request('/consent', {
        method: 'POST',
        body: JSON.stringify({ scopes: scopes || [] })
      });
    },

    /** @returns {Promise<Account[]>} */
    async getAccounts() {
      if (!isConfigured()) throw new OpenFinanceNotConfiguredError();
      return request('/accounts', { method: 'GET' });
    },

    /**
     * @param {string} [accountId]
     * @returns {Promise<Balance[]>}
     */
    async getBalances(accountId) {
      if (!isConfigured()) throw new OpenFinanceNotConfiguredError();
      return request('/balances' + (accountId ? '?accountId=' + encodeURIComponent(accountId) : ''), { method: 'GET' });
    },

    /**
     * @param {string} [accountId]
     * @returns {Promise<(FixedIncomeInvestment|EquityInvestment|FundInvestment|PensionInvestment)[]>}
     */
    async getInvestments(accountId) {
      if (!isConfigured()) throw new OpenFinanceNotConfiguredError();
      return request('/investments' + (accountId ? '?accountId=' + encodeURIComponent(accountId) : ''), { method: 'GET' });
    },

    /**
     * @param {string} accountId
     * @param {{from?: string, to?: string}} [range]
     * @returns {Promise<CashFlowEntry[]>}
     */
    async getTransactions(accountId, range) {
      if (!isConfigured()) throw new OpenFinanceNotConfiguredError();
      const params = new URLSearchParams(Object.assign({ accountId }, range || {}));
      return request('/transactions?' + params.toString(), { method: 'GET' });
    },

    /**
     * Busca, em uma única chamada, a posição consolidada (contas + saldos +
     * investimentos + cartões + empréstimos + financiamentos). É o formato
     * que os componentes de Dashboard Patrimonial no HTML esperam receber.
     * @returns {Promise<ConsolidatedPosition>}
     */
    async getConsolidatedPosition() {
      if (!isConfigured()) throw new OpenFinanceNotConfiguredError();
      return request('/consolidated-position', { method: 'GET' });
    },

    /**
     * Revoga a sessão/consentimento no backend. O backend é responsável por
     * invalidar o refresh token junto ao provedor.
     */
    async disconnect() {
      if (!isConfigured()) {
        throw new OpenFinanceNotConfiguredError();
      }
      return request('/disconnect', { method: 'POST' });
    }
  };

  /* ==========================================================================
   * PONTOS DE INTEGRAÇÃO COM AGREGADORES (não implementados)
   * ==========================================================================
   * Nenhuma chamada é feita a estes provedores a partir do navegador — isso
   * seria uma falha de segurança. Esta lista existe apenas para documentar,
   * dentro do próprio código, onde o backend deverá plugar cada opção.
   * ========================================================================== */
  const OPEN_FINANCE_PROVIDERS_TODO = {
    belvo: 'TODO (backend): orquestrar Open Finance Brasil via Belvo — https://developers.belvo.com',
    pluggy: 'TODO (backend): orquestrar Open Finance Brasil via Pluggy — https://docs.pluggy.ai',
    celcoin: 'TODO (backend): orquestrar Open Finance Brasil via Celcoin — https://docs.celcoin.com.br'
  };

  /* ==========================================================================
   * EXPORTAÇÃO
   * ========================================================================== */
  global.OpenFinance = {
    config: OPEN_FINANCE_CONFIG,
    service: OpenFinanceService,
    providers: OPEN_FINANCE_PROVIDERS_TODO,
    errors: {
      OpenFinanceError,
      OpenFinanceNotConfiguredError,
      OpenFinanceConsentDeniedError,
      OpenFinanceInstitutionUnavailableError,
      OpenFinanceTokenExpiredError,
      OpenFinanceCommunicationError,
      OpenFinanceDataUnavailableError
    }
  };
})(window);
