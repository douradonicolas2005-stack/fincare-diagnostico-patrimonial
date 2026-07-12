// FINCARE INVESTIMENTOS - recebe os leads do Diagnostico Patrimonial, grava
// uma linha por envio numa aba "Leads" ja formatada (moeda, percentual,
// escala de cor no score), e mantem uma aba "Dashboard" com KPIs e graficos
// atualizados automaticamente a cada novo envio.
//
// COMO USAR:
// 1. Abra a planilha em sheets.google.com (a mesma que voce ja usa).
// 2. Menu Extensoes > Apps Script.
// 3. Apague TODO o conteudo do arquivo e cole este arquivo inteiro.
// 4. Salve (Ctrl+S / Cmd+S).
// 5. Implantar > Gerenciar implantacoes > icone de lapis na implantacao
//    existente > em "Versao" escolha "Nova versao" > Implantar.
//    (a URL /exec continua a mesma, nao precisa trocar no site)
// 6. Se o Google pedir autorizacao de novo, aceite normalmente.
// 7. Volte na planilha, recarregue a pagina (F5) e use o menu "Fincare" que
//    vai aparecer no topo para rodar "Reformatar planilha de Leads" uma vez
//    (isso formata tambem as linhas de teste que ja estao la e cria a aba
//    Dashboard pela primeira vez).

var COLS = {
  data: 1, nome: 2, telefone: 3, email: 4, cidade: 5,
  faixa_patrimonio: 6, faixa_renda: 7, instituicao_financeira_atual: 8,
  possui_assessor: 9, possui_gerente_banco: 10, objetivo_financeiro: 11,
  patrimonio_atual: 12, aporte_mensal: 13, renda_desejada: 14,
  rentabilidade_esperada: 15, taxa_retirada: 16, patrimonio_necessario: 17,
  anos_ate_independencia: 18, idade_atual: 19,
  diagnostico_avancado_fonte: 20, diagnostico_avancado_patrimonio_liquido_adicional: 21,
  diagnostico_avancado_alocacao_por_classe: 22, score_patrimonial: 23,
  origem_lead: 24, utm_campaign: 25, utm_source: 26, utm_medium: 27,
  utm_content: 28, utm_term: 29
};

var HEADERS = [
  'data', 'nome', 'telefone', 'email', 'cidade',
  'faixa_patrimonio', 'faixa_renda', 'instituicao_financeira_atual',
  'possui_assessor', 'possui_gerente_banco', 'objetivo_financeiro',
  'patrimonio_atual', 'aporte_mensal', 'renda_desejada', 'rentabilidade_esperada',
  'taxa_retirada', 'patrimonio_necessario', 'anos_ate_independencia', 'idade_atual',
  'diagnostico_avancado_fonte', 'diagnostico_avancado_patrimonio_liquido_adicional',
  'diagnostico_avancado_alocacao_por_classe', 'score_patrimonial',
  'origem_lead', 'utm_campaign', 'utm_source', 'utm_medium', 'utm_content', 'utm_term'
];

var LABELS_FAIXA_PATRIMONIO = {
  'ate_500k': 'Ate R$ 500 mil',
  '500k_1m': 'R$ 500 mil - R$ 1 milhao',
  '1m_5m': 'R$ 1 milhao - R$ 5 milhoes',
  '5m_mais': 'Acima de R$ 5 milhoes'
};
var LABELS_FAIXA_RENDA = {
  'ate_15k': 'Ate R$ 15 mil',
  '15k_40k': 'R$ 15 mil - R$ 40 mil',
  '40k_100k': 'R$ 40 mil - R$ 100 mil',
  '100k_mais': 'Acima de R$ 100 mil'
};
var LABELS_OBJETIVO = {
  'viver_de_renda': 'Viver de renda',
  'aposentadoria': 'Aposentadoria',
  'sucessao': 'Sucessao patrimonial',
  'protecao': 'Protecao patrimonial',
  'eficiencia_tributaria': 'Eficiencia tributaria'
};
var LABELS_FONTE_AVANCADO = {
  'manual': 'Informou os dados manualmente',
  'portfolio': 'Importou a carteira',
  'nenhuma (apenas diagnostico rapido)': 'So fez o diagnostico rapido'
};

// Formatos numericos do Sheets (moeda/percentual) precisam de aspas duplas
// literais dentro da string de formato. Montamos o caractere de aspas assim,
// em vez de aninhar aspas duplas dentro de aspas simples no codigo-fonte,
// para o script nao quebrar se o editor onde voce colar trocar aspas retas
// por aspas curvas automaticamente.
var ASPAS = String.fromCharCode(34);
var FORMATO_MOEDA = ASPAS + 'R$' + ASPAS + ' #,##0.00';
var FORMATO_SCORE = '0' + ASPAS + '%' + ASPAS;

// ================================================================
// RECEBIMENTO DOS DADOS
// ================================================================
// Acha a ultima linha com dado real na coluna "data" (coluna A). Nao usamos
// sheet.getLastRow() para isso porque ele considera conteudo em QUALQUER
// coluna da planilha - se colunas calculadas depois de AC (ex: "data_real",
// "lead_valido") tiverem formulas preenchidas bem mais abaixo dos leads
// reais, getLastRow() retornaria essa linha distante e o proximo lead
// gravado (via appendRow ou range baseado nele) cairia num buraco vazio,
// longe de onde deveria. Olhando so a coluna A evitamos isso.
function getUltimaLinhaComDados_(sheet) {
  var maxRows = sheet.getMaxRows();
  var colunaData = sheet.getRange(1, COLS.data, maxRows, 1).getValues();
  for (var i = colunaData.length - 1; i >= 0; i--) {
    if (colunaData[i][0] !== '') return i + 1;
  }
  return 0;
}

function doPost(e) {
  var sheet = getLeadsSheet_();
  var data = JSON.parse(e.postData.contents);

  var ultimaLinha = getUltimaLinhaComDados_(sheet);
  if (ultimaLinha === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    formatarCabecalho_(sheet);
    ultimaLinha = 1;
  }

  var row = HEADERS.map(function (h) {
    var v = data[h];
    return (v === undefined || v === null) ? '' : v;
  });
  row[COLS.data - 1] = data.data ? new Date(data.data) : new Date();

  // Escreve so nas colunas A:AC (o tamanho exato de "row"), nunca em
  // colunas calculadas que existam depois delas.
  var novaLinha = ultimaLinha + 1;
  sheet.getRange(novaLinha, 1, 1, row.length).setValues([row]);
  formatarLinha_(sheet, novaLinha);
  aplicarFormatacaoCondicionalScore_(sheet);
  atualizarDashboard();

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Leads');
  }
  return sheet;
}

// ================================================================
// FORMATACAO DA ABA "Leads"
// ================================================================
function formatarCabecalho_(sheet) {
  var header = sheet.getRange(1, 1, 1, HEADERS.length);
  header.setFontWeight('bold');
  header.setFontColor('#FFFFFF');
  header.setBackground('#003B49');
  header.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, HEADERS.length, 150);
  sheet.setColumnWidth(COLS.data, 130);
  sheet.setColumnWidth(COLS.nome, 170);
  sheet.setColumnWidth(COLS.email, 190);
  sheet.setColumnWidth(COLS.diagnostico_avancado_alocacao_por_classe, 260);
}

function formatarLinha_(sheet, row) {
  var percentual = '0.0%';

  [COLS.patrimonio_atual, COLS.aporte_mensal, COLS.renda_desejada,
   COLS.patrimonio_necessario, COLS.diagnostico_avancado_patrimonio_liquido_adicional]
    .forEach(function (c) { sheet.getRange(row, c).setNumberFormat(FORMATO_MOEDA); });

  [COLS.rentabilidade_esperada, COLS.taxa_retirada]
    .forEach(function (c) { sheet.getRange(row, c).setNumberFormat(percentual); });

  sheet.getRange(row, COLS.data).setNumberFormat('dd/mm/yyyy hh:mm');
  sheet.getRange(row, COLS.score_patrimonial).setNumberFormat(FORMATO_SCORE);
}

function aplicarFormatacaoCondicionalScore_(sheet) {
  var lastRow = Math.max(2, getUltimaLinhaComDados_(sheet));
  var range = sheet.getRange(2, COLS.score_patrimonial, lastRow - 1, 1);
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpointWithValue('#2B7E7E', SpreadsheetApp.InterpolationType.NUMBER, '100')
    .setGradientMidpointWithValue('#FDE293', SpreadsheetApp.InterpolationType.NUMBER, '50')
    .setGradientMinpointWithValue('#E06666', SpreadsheetApp.InterpolationType.NUMBER, '0')
    .setRanges([range])
    .build();
  sheet.setConditionalFormatRules([rule]);
}

// Reformata o cabecalho e todas as linhas ja existentes (util para dados
// antigos que entraram antes desta versao do script) e reconstroi o
// Dashboard. Rode uma vez pelo menu "Fincare" apos atualizar o script.
function formatarTodasAsLinhas() {
  var sheet = getLeadsSheet_();
  formatarCabecalho_(sheet);
  var lastRow = getUltimaLinhaComDados_(sheet);
  for (var r = 2; r <= lastRow; r++) {
    formatarLinha_(sheet, r);
  }
  aplicarFormatacaoCondicionalScore_(sheet);
  atualizarDashboard();
}

// ================================================================
// ABA "Dashboard" - KPIs e graficos
// ================================================================
function atualizarDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var leads = getLeadsSheet_();
  var lastRow = getUltimaLinhaComDados_(leads);
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');
  }
  dash.getCharts().forEach(function (c) { dash.removeChart(c); });
  dash.clear();
  dash.setColumnWidths(1, 6, 170);

  dash.getRange(1, 1).setValue('Dashboard de Leads - Fincare Investimentos');
  dash.getRange(1, 1).setFontWeight('bold').setFontSize(16);

  if (lastRow < 2) {
    dash.getRange(3, 1).setValue('Ainda nao ha leads registrados.');
    return;
  }

  var values = leads.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var total = values.length;

  var somaScore = 0, somaPatrimonio = 0, comDiagnosticoAvancado = 0;
  var countFaixaPatrimonio = {}, countFaixaRenda = {}, countObjetivo = {};
  var countFonteAvancado = {}, countUtmSource = {};
  var faixasScore = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100

  values.forEach(function (r) {
    var faixaPatrimonio = r[COLS.faixa_patrimonio - 1];
    var faixaRenda = r[COLS.faixa_renda - 1];
    var objetivo = r[COLS.objetivo_financeiro - 1];
    var fonteAvancado = r[COLS.diagnostico_avancado_fonte - 1];
    var utmSource = r[COLS.utm_source - 1];
    var score = Number(r[COLS.score_patrimonial - 1]) || 0;
    var patrimonio = Number(r[COLS.patrimonio_atual - 1]) || 0;

    somaScore += score;
    somaPatrimonio += patrimonio;

    if (faixaPatrimonio) countFaixaPatrimonio[faixaPatrimonio] = (countFaixaPatrimonio[faixaPatrimonio] || 0) + 1;
    if (faixaRenda) countFaixaRenda[faixaRenda] = (countFaixaRenda[faixaRenda] || 0) + 1;
    if (objetivo) countObjetivo[objetivo] = (countObjetivo[objetivo] || 0) + 1;
    if (fonteAvancado) {
      countFonteAvancado[fonteAvancado] = (countFonteAvancado[fonteAvancado] || 0) + 1;
      if (fonteAvancado === 'manual' || fonteAvancado === 'portfolio') comDiagnosticoAvancado++;
    }
    if (utmSource) countUtmSource[utmSource] = (countUtmSource[utmSource] || 0) + 1;

    var bucket = Math.max(0, Math.min(4, Math.floor(score / 20)));
    faixasScore[bucket]++;
  });

  var scoreMedio = total ? (somaScore / total) : 0;
  var patrimonioMedio = total ? (somaPatrimonio / total) : 0;
  var pctAvancado = total ? (comDiagnosticoAvancado / total) : 0;

  // --- KPIs ---
  var kpiLabels = ['Total de leads', 'Score patrimonial medio', 'Patrimonio medio informado', 'Com diagnostico avancado'];
  var kpiValues = [total, Math.round(scoreMedio) + '%', patrimonioMedio, (Math.round(pctAvancado * 1000) / 10) + '%'];
  for (var i = 0; i < kpiLabels.length; i++) {
    var linha = 3 + i;
    dash.getRange(linha, 1).setValue(kpiLabels[i]).setFontWeight('bold');
    var cell = dash.getRange(linha, 2).setValue(kpiValues[i]);
    if (i === 2) cell.setNumberFormat(FORMATO_MOEDA);
  }

  // --- Tabelas auxiliares + graficos ---
  var t1 = escreverTabela_(dash, 9, 'Faixa de patrimonio', countFaixaPatrimonio, LABELS_FAIXA_PATRIMONIO);
  var t2 = escreverTabela_(dash, t1.nextRow + 1, 'Faixa de renda', countFaixaRenda, LABELS_FAIXA_RENDA);
  var t3 = escreverTabela_(dash, t2.nextRow + 1, 'Objetivo financeiro', countObjetivo, LABELS_OBJETIVO);
  var t4 = escreverTabela_(dash, t3.nextRow + 1, 'Fonte do diagnostico avancado', countFonteAvancado, LABELS_FONTE_AVANCADO);

  var labelsScoreBucket = { '0': '0-20% (longe da meta)', '1': '20-40%', '2': '40-60%', '3': '60-80%', '4': '80-100% (perto da meta)' };
  var countScoreBucket = {};
  faixasScore.forEach(function (qtd, idx) { countScoreBucket[String(idx)] = qtd; });
  var t5 = escreverTabela_(dash, t4.nextRow + 1, 'Distribuicao de score patrimonial', countScoreBucket, labelsScoreBucket);

  var t6 = escreverTabela_(dash, t5.nextRow + 1, 'Origem dos leads (UTM Source)', countUtmSource, {});

  inserirGrafico_(dash, Charts.ChartType.PIE, t1.range, 'Leads por faixa de patrimonio', 8, 4);
  inserirGrafico_(dash, Charts.ChartType.COLUMN, t2.range, 'Leads por faixa de renda', 8, 10);
  inserirGrafico_(dash, Charts.ChartType.COLUMN, t3.range, 'Leads por objetivo financeiro', 24, 4);
  inserirGrafico_(dash, Charts.ChartType.PIE, t4.range, 'Fonte do diagnostico avancado', 24, 10);
  inserirGrafico_(dash, Charts.ChartType.COLUMN, t5.range, 'Distribuicao de score patrimonial', 40, 4);
  inserirGrafico_(dash, Charts.ChartType.COLUMN, t6.range, 'Origem dos leads (UTM Source)', 40, 10);
}

function escreverTabela_(sheet, linhaInicial, titulo, contagens, labels) {
  sheet.getRange(linhaInicial, 1).setValue(titulo).setFontWeight('bold');
  sheet.getRange(linhaInicial + 1, 1).setValue('Categoria');
  sheet.getRange(linhaInicial + 1, 2).setValue('Leads');
  sheet.getRange(linhaInicial + 1, 1, 1, 2).setFontWeight('bold').setBackground('#EAF2F1');

  var chaves = Object.keys(contagens).sort(function (a, b) { return contagens[b] - contagens[a]; });

  if (chaves.length === 0) {
    sheet.getRange(linhaInicial + 2, 1).setValue('(sem dados ainda)');
    return { nextRow: linhaInicial + 3, range: sheet.getRange(linhaInicial + 1, 1, 1, 2) };
  }

  for (var i = 0; i < chaves.length; i++) {
    var chave = chaves[i];
    var rotulo = labels[chave] || chave;
    sheet.getRange(linhaInicial + 2 + i, 1).setValue(rotulo);
    sheet.getRange(linhaInicial + 2 + i, 2).setValue(contagens[chave]);
  }

  return {
    nextRow: linhaInicial + 2 + chaves.length,
    range: sheet.getRange(linhaInicial + 1, 1, chaves.length + 1, 2)
  };
}

function inserirGrafico_(sheet, tipo, range, titulo, anchorRow, anchorCol) {
  var chart = sheet.newChart()
    .setChartType(tipo)
    .addRange(range)
    .setPosition(anchorRow, anchorCol, 0, 0)
    .setOption('title', titulo)
    .setOption('width', 420)
    .setOption('height', 260)
    .setOption('legend', { position: 'right' })
    .build();
  sheet.insertChart(chart);
}

// ================================================================
// MENU DENTRO DA PLANILHA (Extensoes > Fincare, apos recarregar a pagina)
// ================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Fincare')
    .addItem('Atualizar Dashboard agora', 'atualizarDashboard')
    .addItem('Reformatar planilha de Leads', 'formatarTodasAsLinhas')
    .addToUi();
}
