// FINCARE INVESTIMENTOS - recebe os leads do Diagnostico Patrimonial, grava
// uma linha por envio numa aba "Leads" ja formatada (moeda, percentual,
// escala de cor no score), e constroi uma estrutura completa de analise
// (Dashboard, Aquisicao, Priorizacao de Leads, Como Usar) com formulas
// nativas do Sheets que se atualizam sozinhas conforme novos leads chegam.
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
//    vai aparecer no topo:
//    - "Construir/atualizar estrutura de analise completa": cria/reconstroi
//      as abas Dashboard, Aquisicao, Priorizacao de Leads e Como Usar.
//    - "Reformatar planilha de Leads": reformata o cabecalho e as linhas
//      da aba Leads, e tambem reconstroi a estrutura de analise.

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
  utm_content: 28, utm_term: 29, perfil_investidor: 30, estado: 31
};

var HEADERS = [
  'data', 'nome', 'telefone', 'email', 'cidade',
  'faixa_patrimonio', 'faixa_renda', 'instituicao_financeira_atual',
  'possui_assessor', 'possui_gerente_banco', 'objetivo_financeiro',
  'patrimonio_atual', 'aporte_mensal', 'renda_desejada', 'rentabilidade_esperada',
  'taxa_retirada', 'patrimonio_necessario', 'anos_ate_independencia', 'idade_atual',
  'diagnostico_avancado_fonte', 'diagnostico_avancado_patrimonio_liquido_adicional',
  'diagnostico_avancado_alocacao_por_classe', 'score_patrimonial',
  'origem_lead', 'utm_campaign', 'utm_source', 'utm_medium', 'utm_content', 'utm_term',
  'perfil_investidor', 'estado'
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
var FORMATO_MOEDA_INTEIRO = ASPAS + 'R$' + ASPAS + ' #,##0';
var FORMATO_SCORE = '0' + ASPAS + '%' + ASPAS;
var FORMATO_AVG_ANOS = '0.0' + ASPAS + ' anos' + ASPAS;
var FORMATO_IDADE = '0' + ASPAS + ' anos' + ASPAS;

// Colunas auxiliares calculadas, logo depois da ultima coluna de dados (AE).
var COL_DATA_REAL = COLS.estado + 1;   // 32 = AF
var COL_LEAD_VALIDO = COLS.estado + 2; // 33 = AG

var PALETA_CARDS = [
  '#2A9D8F', '#E9C46A', '#87A96B',
  '#E76F51', '#2A9D8F', '#E9C46A',
  '#87A96B', '#E76F51', '#2A9D8F'
];

// ================================================================
// RECEBIMENTO DOS DADOS
// ================================================================
// Acha a ultima linha com dado real na coluna "data" (coluna A). Nao usamos
// sheet.getLastRow() para isso porque ele considera conteudo em QUALQUER
// coluna da planilha - as ARRAYFORMULA das colunas auxiliares (AD, AE)
// preenchem a coluna inteira de uma vez, entao getLastRow() sempre
// retornaria a ultima linha da planilha, nao a ultima linha com lead real.
// Olhando so a coluna A evitamos isso.
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
    configurarColunasAuxiliares_(sheet, getSeparador_());
    ultimaLinha = 1;
  }

  var row = HEADERS.map(function (h) {
    var v = data[h];
    return (v === undefined || v === null) ? '' : v;
  });
  row[COLS.data - 1] = data.data ? new Date(data.data) : new Date();

  // Escreve so nas colunas A:AE (o tamanho exato de "row"), nunca em
  // colunas calculadas que existam depois delas.
  var novaLinha = ultimaLinha + 1;
  sheet.getRange(novaLinha, 1, 1, row.length).setValues([row]);
  formatarLinha_(sheet, novaLinha);
  aplicarFormatacaoCondicionalScore_(sheet);

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
  header.setValues([HEADERS]);
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
// antigos que entraram antes desta versao do script) e reconstroi toda a
// estrutura de analise. Rode uma vez pelo menu "Fincare" apos atualizar
// o script.
function formatarTodasAsLinhas() {
  var sheet = getLeadsSheet_();
  formatarCabecalho_(sheet);
  var lastRow = getUltimaLinhaComDados_(sheet);
  for (var r = 2; r <= lastRow; r++) {
    formatarLinha_(sheet, r);
  }
  aplicarFormatacaoCondicionalScore_(sheet);
  construirEstruturaAnalitica();
}

// ================================================================
// UTILITARIOS DE FORMULA (locale e aspas seguros contra copia/cola)
// ================================================================
// Descobre se a planilha usa localidade pt-BR (separador de argumentos ";")
// ou outras localidades (separador ","), para montar formulas compativeis.
function getSeparador_() {
  var locale = SpreadsheetApp.getActive().getSpreadsheetLocale();
  if (locale && locale.toLowerCase().indexOf('pt') === 0) return ';';
  return ',';
}

// Escreve os templates de formula usando ";" como separador de argumentos
// e "~texto~" no lugar de aspas duplas. montarFormula_ troca ";" pelo
// separador real da planilha e "~" pelo caractere de aspas dupla real,
// no fim, numa unica passada - assim o codigo-fonte nunca tem aspas
// duplas aninhadas dentro de aspas simples (o que ja quebrou antes se
// o editor onde voce cola trocar aspas retas por aspas curvas).
function montarFormula_(template, sep) {
  var s = template.split(';').join(sep);
  s = s.split('~').join(ASPAS);
  return s;
}

// Le uma coluna inteira da aba Leads (ignorando o cabecalho) e devolve os
// valores distintos e nao vazios que realmente aparecem nos dados, na
// ordem em que foram encontrados.
function detectarValoresDistintos_(sheet, coluna) {
  var ultimaLinha = getUltimaLinhaComDados_(sheet);
  if (ultimaLinha < 2) return [];
  var valores = sheet.getRange(2, coluna, ultimaLinha - 1, 1).getValues();
  var vistos = {};
  var distintos = [];
  valores.forEach(function (v) {
    var val = v[0];
    if (val !== '' && val !== null && val !== undefined && !vistos[val]) {
      vistos[val] = true;
      distintos.push(val);
    }
  });
  return distintos;
}

// Toda vez que uma coluna de dados nova e adicionada ao final (ex:
// perfil_investidor, estado), data_real/lead_valido empurram para a frente
// e a formula ARRAYFORMULA antiga fica presa na coluna que passou a ser de
// dados comuns - bloqueando a escrita de leads novos ali. Varre uma faixa
// de colunas perto do fim do cabecalho e limpa qualquer "data_real"/
// "lead_valido" que nao esteja mais na posicao atual de COL_DATA_REAL/
// COL_LEAD_VALIDO.
function limparColunasAuxiliaresAntigas_(sheet) {
  var margem = 5;
  var ultimaColuna = HEADERS.length + margem;
  for (var c = 1; c <= ultimaColuna; c++) {
    if (c === COL_DATA_REAL || c === COL_LEAD_VALIDO) continue;
    var valor = sheet.getRange(1, c).getValue();
    if (valor === 'data_real' || valor === 'lead_valido') {
      sheet.getRange(1, c, sheet.getMaxRows(), 1).clearContent().clearFormat();
    }
  }
}

// ================================================================
// COLUNAS AUXILIARES NA ABA "Leads" (AF = data_real, AG = lead_valido)
// ================================================================
function configurarColunasAuxiliares_(sheet, sep) {
  limparColunasAuxiliaresAntigas_(sheet);

  // O cabecalho (linha 1) fica sempre como texto simples, igual as outras
  // 31 colunas - o Sheets bloqueia formula direto na linha de cabecalho
  // quando o intervalo esta configurado como Tabela nativa. A formula
  // comeca na linha 2 e se expande sozinha dali pra baixo.
  sheet.getRange(1, COL_DATA_REAL).setValue('data_real');
  sheet.getRange(1, COL_LEAD_VALIDO).setValue('lead_valido');

  var formulaDataReal = montarFormula_(
    '=ARRAYFORMULA(IF(A2:A=~~;~~;IFERROR(DATEVALUE(LEFT(A2:A;10));~~)))',
    sep
  );
  var formulaLeadValido = montarFormula_(
    '=ARRAYFORMULA(IF(D2:D=~~;~~;1))',
    sep
  );

  sheet.getRange(2, COL_DATA_REAL).setFormula(formulaDataReal);
  sheet.getRange(2, COL_LEAD_VALIDO).setFormula(formulaLeadValido);

  [COL_DATA_REAL, COL_LEAD_VALIDO].forEach(function (c) {
    sheet.getRange(1, c).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#003B49');
  });

  sheet.getRange(2, COL_DATA_REAL, sheet.getMaxRows() - 1, 1).setNumberFormat('dd/mm/yyyy');
  sheet.setColumnWidth(COL_DATA_REAL, 110);
  sheet.setColumnWidth(COL_LEAD_VALIDO, 100);
}

// ================================================================
// HELPERS VISUAIS COMPARTILHADOS ENTRE AS ABAS DE ANALISE
// ================================================================
function estilizarTitulo_(sheet, texto, subtitulo) {
  sheet.getRange(1, 1, 1, 9).merge();
  sheet.getRange(1, 1).setValue(texto);
  sheet.getRange(1, 1, 1, 9)
    .setBackground('#1F2A44').setFontColor('#FFFFFF').setFontFamily('Arial')
    .setFontSize(18).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 44);

  if (subtitulo) {
    sheet.getRange(2, 1, 1, 9).merge();
    sheet.getRange(2, 1).setValue(subtitulo);
    sheet.getRange(2, 1, 1, 9)
      .setFontColor('#666666').setFontFamily('Arial').setFontStyle('italic')
      .setHorizontalAlignment('center');
  }
}

function escreverKpiCard_(sheet, linhaBanda, colInicial, titulo, corBanda) {
  var faixa = sheet.getRange(linhaBanda, colInicial, 1, 2);
  faixa.merge().setBackground(corBanda);
  sheet.setRowHeight(linhaBanda, 6);

  var linhaLabel = linhaBanda + 1;
  var rangeLabel = sheet.getRange(linhaLabel, colInicial, 1, 2);
  rangeLabel.merge().setValue(titulo);
  rangeLabel.setFontFamily('Arial').setFontSize(9).setFontColor('#666666')
    .setHorizontalAlignment('center').setWrap(true);

  var linhaValor = linhaLabel + 1;
  var rangeValor = sheet.getRange(linhaValor, colInicial, 1, 2);
  rangeValor.merge();
  rangeValor.setFontFamily('Arial').setFontSize(20).setFontColor('#1F2A44')
    .setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(linhaValor, 34);

  return rangeValor;
}

// Bloco "Categoria | Leads | % do total", uma linha por valor distinto.
function escreverBlocoDistribuicao_(sheet, linhaInicial, titulo, colunaLetra, valores, labels, sep) {
  sheet.getRange(linhaInicial, 1).setValue(titulo)
    .setFontWeight('bold').setFontFamily('Arial').setFontSize(12).setFontColor('#1F2A44');

  var linhaHeader = linhaInicial + 1;
  var headerRange = sheet.getRange(linhaHeader, 1, 1, 3);
  headerRange.setValues([['Categoria', 'Leads', '% do total']]);
  headerRange.setBackground('#1F2A44').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');

  if (valores.length === 0) {
    sheet.getRange(linhaHeader + 1, 1).setValue('(sem dados ainda)').setFontFamily('Arial').setFontColor('#999999');
    return linhaHeader + 3;
  }

  for (var i = 0; i < valores.length; i++) {
    var valor = valores[i];
    var rotulo = (labels && labels[valor]) ? labels[valor] : valor;
    var linha = linhaHeader + 1 + i;

    sheet.getRange(linha, 1).setValue(rotulo).setFontFamily('Arial');

    var templateContagem =
      '=COUNTIFS(Leads!$' + colunaLetra + '$2:$' + colunaLetra + ';~' + valor + '~;Leads!$D$2:$D;~?*~)';
    sheet.getRange(linha, 2).setFormula(montarFormula_(templateContagem, sep));

    var templatePct = '=IFERROR(B' + linha + '/COUNTIF(Leads!$D$2:$D;~?*~);0)';
    sheet.getRange(linha, 3).setFormula(montarFormula_(templatePct, sep));
    sheet.getRange(linha, 3).setNumberFormat('0.0%');
  }

  sheet.getRange(linhaHeader, 1, valores.length + 1, 3)
    .setBorder(true, true, true, true, true, true, '#DDDDDD', SpreadsheetApp.BorderStyle.SOLID);

  return linhaHeader + 2 + valores.length;
}

// Bloco de distribuicao do score patrimonial (coluna W, escala 0-100) em
// 5 faixas fixas de 20 pontos. Usa os valores de W direto, sem dividir
// por 100 - a escala 0-100 so vira porcentagem no KPI "score medio".
function escreverBlocoScore_(sheet, linhaInicial, sep) {
  sheet.getRange(linhaInicial, 1).setValue('Distribuicao de Score Patrimonial')
    .setFontWeight('bold').setFontFamily('Arial').setFontSize(12).setFontColor('#1F2A44');

  var linhaHeader = linhaInicial + 1;
  var headerRange = sheet.getRange(linhaHeader, 1, 1, 3);
  headerRange.setValues([['Categoria', 'Leads', '% do total']]);
  headerRange.setBackground('#1F2A44').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');

  var faixas = [
    { min: 0, max: 20, rotulo: '0-20 (longe da meta)' },
    { min: 20, max: 40, rotulo: '20-40' },
    { min: 40, max: 60, rotulo: '40-60' },
    { min: 60, max: 80, rotulo: '60-80' },
    { min: 80, max: 100, rotulo: '80-100 (perto da meta)' }
  ];

  for (var i = 0; i < faixas.length; i++) {
    var f = faixas[i];
    var linha = linhaHeader + 1 + i;
    var ultimaFaixa = (i === faixas.length - 1);
    var criterioMax = ultimaFaixa ? ('~<=' + f.max + '~') : ('~<' + f.max + '~');

    sheet.getRange(linha, 1).setValue(f.rotulo).setFontFamily('Arial');

    var templateContagem =
      '=COUNTIFS(Leads!$W$2:$W;~>=' + f.min + '~;Leads!$W$2:$W;' + criterioMax + ';Leads!$D$2:$D;~?*~)';
    sheet.getRange(linha, 2).setFormula(montarFormula_(templateContagem, sep));

    var templatePct = '=IFERROR(B' + linha + '/COUNTIF(Leads!$D$2:$D;~?*~);0)';
    sheet.getRange(linha, 3).setFormula(montarFormula_(templatePct, sep));
    sheet.getRange(linha, 3).setNumberFormat('0.0%');
  }

  sheet.getRange(linhaHeader, 1, faixas.length + 1, 3)
    .setBorder(true, true, true, true, true, true, '#DDDDDD', SpreadsheetApp.BorderStyle.SOLID);

  return linhaHeader + 2 + faixas.length;
}

// ================================================================
// ABA "Dashboard"
// ================================================================
function construirDashboard_(ss, leadsSheet, sep) {
  var existente = ss.getSheetByName('Dashboard');
  if (existente) { ss.deleteSheet(existente); }
  var dash = ss.insertSheet('Dashboard');
  dash.setHiddenGridlines(true);
  dash.setColumnWidths(1, 9, 110);

  estilizarTitulo_(dash, 'FINCARE - Dashboard de Leads do Simulador',
    'Atualizado automaticamente conforme o webhook grava novos leads');

  var kpis = [
    { titulo: 'TOTAL DE LEADS VALIDOS',
      formula: '=COUNTIF(Leads!$D$2:$D;~?*~)', formato: '0' },
    { titulo: 'SCORE PATRIMONIAL MEDIO',
      formula: '=IFERROR(AVERAGEIFS(Leads!$W$2:$W;Leads!$D$2:$D;~?*~)/100;0)', formato: '0.0%' },
    { titulo: 'PATRIMONIO MEDIO INFORMADO',
      formula: '=IFERROR(AVERAGEIFS(Leads!$L$2:$L;Leads!$D$2:$D;~?*~);0)', formato: FORMATO_MOEDA_INTEIRO },
    { titulo: 'APORTE MENSAL MEDIO',
      formula: '=IFERROR(AVERAGEIFS(Leads!$M$2:$M;Leads!$D$2:$D;~?*~);0)', formato: FORMATO_MOEDA_INTEIRO },
    { titulo: 'RENDA DESEJADA MEDIA',
      formula: '=IFERROR(AVERAGEIFS(Leads!$N$2:$N;Leads!$D$2:$D;~?*~);0)', formato: FORMATO_MOEDA_INTEIRO },
    { titulo: '% COM DIAGNOSTICO AVANCADO',
      formula: '=IFERROR(COUNTIFS(Leads!$T$2:$T;~<>nenhuma (apenas diagnostico rapido)~;Leads!$D$2:$D;~?*~)/COUNTIF(Leads!$D$2:$D;~?*~);0)',
      formato: '0.0%' },
    { titulo: '% QUE JA TEM ASSESSOR',
      formula: '=IFERROR(COUNTIFS(Leads!$I$2:$I;~sim~;Leads!$D$2:$D;~?*~)/COUNTIF(Leads!$D$2:$D;~?*~);0)', formato: '0.0%' },
    { titulo: 'ANOS MEDIOS ATE INDEPENDENCIA',
      formula: '=IFERROR(AVERAGEIFS(Leads!$R$2:$R;Leads!$D$2:$D;~?*~);0)', formato: FORMATO_AVG_ANOS },
    { titulo: 'IDADE MEDIA',
      formula: '=IFERROR(AVERAGEIFS(Leads!$S$2:$S;Leads!$D$2:$D;~?*~);0)', formato: FORMATO_IDADE }
  ];

  var colunasCard = [1, 4, 7];
  var linhasBanda = [4, 8, 12];
  var idx = 0;
  for (var bloco = 0; bloco < 3; bloco++) {
    for (var c = 0; c < 3; c++) {
      var kpi = kpis[idx];
      var valueRange = escreverKpiCard_(dash, linhasBanda[bloco], colunasCard[c], kpi.titulo, PALETA_CARDS[idx]);
      valueRange.setFormula(montarFormula_(kpi.formula, sep));
      valueRange.setNumberFormat(kpi.formato);
      idx++;
    }
  }

  var valoresF = detectarValoresDistintos_(leadsSheet, COLS.faixa_patrimonio);
  var valoresG = detectarValoresDistintos_(leadsSheet, COLS.faixa_renda);
  var valoresK = detectarValoresDistintos_(leadsSheet, COLS.objetivo_financeiro);

  var linha = 17;
  linha = escreverBlocoDistribuicao_(dash, linha, 'Distribuicao por Faixa de Patrimonio', 'F', valoresF, LABELS_FAIXA_PATRIMONIO, sep);
  linha = escreverBlocoDistribuicao_(dash, linha, 'Distribuicao por Faixa de Renda', 'G', valoresG, LABELS_FAIXA_RENDA, sep);
  linha = escreverBlocoDistribuicao_(dash, linha, 'Distribuicao por Objetivo Financeiro', 'K', valoresK, LABELS_OBJETIVO, sep);
  escreverBlocoScore_(dash, linha, sep);

  return dash;
}

// ================================================================
// ABA "Aquisicao"
// ================================================================
function construirAquisicao_(ss, leadsSheet, sep) {
  var existente = ss.getSheetByName('Aquisicao');
  if (existente) { ss.deleteSheet(existente); }
  var aq = ss.insertSheet('Aquisicao');
  aq.setHiddenGridlines(true);
  aq.setColumnWidths(1, 6, 150);

  estilizarTitulo_(aq, 'FINCARE - Performance de Aquisicao por Canal', null);

  aq.getRange(3, 1, 1, 6).merge();
  aq.getRange(3, 1)
    .setValue('Preencha a coluna com os valores de utm_source/utm_campaign que voce usa nos anuncios.')
    .setFontFamily('Arial').setFontColor('#666666').setFontStyle('italic');

  // ---- Tabela 1: por canal (utm_source) ----
  var linhaTitulo1 = 5;
  aq.getRange(linhaTitulo1, 1).setValue('Por Canal (utm_source)')
    .setFontWeight('bold').setFontFamily('Arial').setFontSize(12).setFontColor('#1F2A44');

  var linhaHeader1 = linhaTitulo1 + 1;
  aq.getRange(linhaHeader1, 1, 1, 6).setValues([[
    'utm_source (edite)', 'Leads', '% do total', 'Score medio', 'Patrim. medio', 'Aporte medio'
  ]]);
  aq.getRange(linhaHeader1, 1, 1, 6)
    .setBackground('#1F2A44').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');

  var canaisDetectados = detectarValoresDistintos_(leadsSheet, COLS.utm_source);
  var canaisSugeridos = ['instagram', 'facebook', 'google', 'organico'];
  var canaisParaListar = canaisSugeridos.slice();
  canaisDetectados.forEach(function (c) {
    if (canaisParaListar.indexOf(c) === -1) canaisParaListar.push(c);
  });
  var linhasExtras = 3;
  var totalLinhasCanal = canaisParaListar.length + linhasExtras;

  for (var i = 0; i < totalLinhasCanal; i++) {
    var linha = linhaHeader1 + 1 + i;
    var valorCanal = (i < canaisParaListar.length) ? canaisParaListar[i] : '';

    aq.getRange(linha, 1).setValue(valorCanal).setBackground('#FFF3C4').setFontFamily('Arial');
    var refCanal = 'A' + linha;

    var tLeads = '=IF(' + refCanal + '=~~;~~;COUNTIFS(Leads!$Z$2:$Z;' + refCanal + ';Leads!$D$2:$D;~?*~))';
    aq.getRange(linha, 2).setFormula(montarFormula_(tLeads, sep));

    var tPct = '=IFERROR(IF(' + refCanal + '=~~;~~;B' + linha + '/COUNTIF(Leads!$D$2:$D;~?*~));~~)';
    aq.getRange(linha, 3).setFormula(montarFormula_(tPct, sep));
    aq.getRange(linha, 3).setNumberFormat('0.0%');

    var tScore = '=IFERROR(IF(' + refCanal + '=~~;~~;AVERAGEIFS(Leads!$W$2:$W;Leads!$Z$2:$Z;' + refCanal + ';Leads!$D$2:$D;~?*~));~~)';
    aq.getRange(linha, 4).setFormula(montarFormula_(tScore, sep));
    aq.getRange(linha, 4).setNumberFormat('0' + ASPAS + '/100' + ASPAS);

    var tPatr = '=IFERROR(IF(' + refCanal + '=~~;~~;AVERAGEIFS(Leads!$L$2:$L;Leads!$Z$2:$Z;' + refCanal + ';Leads!$D$2:$D;~?*~));~~)';
    aq.getRange(linha, 5).setFormula(montarFormula_(tPatr, sep));
    aq.getRange(linha, 5).setNumberFormat(FORMATO_MOEDA_INTEIRO);

    var tAporte = '=IFERROR(IF(' + refCanal + '=~~;~~;AVERAGEIFS(Leads!$M$2:$M;Leads!$Z$2:$Z;' + refCanal + ';Leads!$D$2:$D;~?*~));~~)';
    aq.getRange(linha, 6).setFormula(montarFormula_(tAporte, sep));
    aq.getRange(linha, 6).setNumberFormat(FORMATO_MOEDA_INTEIRO);
  }

  var linhaTotal1 = linhaHeader1 + 1 + totalLinhasCanal;
  aq.getRange(linhaTotal1, 1).setValue('TOTAL').setFontWeight('bold').setFontFamily('Arial');
  aq.getRange(linhaTotal1, 2).setFormula(montarFormula_('=COUNTIF(Leads!$D$2:$D;~?*~)', sep)).setFontWeight('bold');
  aq.getRange(linhaTotal1, 3).setValue(1).setNumberFormat('0.0%').setFontWeight('bold');
  aq.getRange(linhaTotal1, 1, 1, 6)
    .setBorder(true, null, true, null, null, null, '#1F2A44', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  aq.getRange(linhaHeader1, 1, totalLinhasCanal + 2, 6)
    .setBorder(true, true, true, true, true, true, '#DDDDDD', SpreadsheetApp.BorderStyle.SOLID);

  // ---- Tabela 2: por campanha (utm_campaign) ----
  var linhaTitulo2 = linhaTotal1 + 3;
  aq.getRange(linhaTitulo2, 1).setValue('Por Campanha (utm_campaign)')
    .setFontWeight('bold').setFontFamily('Arial').setFontSize(12).setFontColor('#1F2A44');

  var linhaHeader2 = linhaTitulo2 + 1;
  aq.getRange(linhaHeader2, 1, 1, 4).setValues([[
    'utm_campaign', 'Leads', 'Score medio', 'Patrim. medio'
  ]]);
  aq.getRange(linhaHeader2, 1, 1, 4)
    .setBackground('#1F2A44').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');

  var campanhas = detectarValoresDistintos_(leadsSheet, COLS.utm_campaign);

  if (campanhas.length === 0) {
    aq.getRange(linhaHeader2 + 1, 1).setValue('(nenhuma campanha registrada ainda)')
      .setFontFamily('Arial').setFontColor('#999999');
  } else {
    for (var j = 0; j < campanhas.length; j++) {
      var linhaC = linhaHeader2 + 1 + j;
      var campanha = campanhas[j];
      aq.getRange(linhaC, 1).setValue(campanha).setFontFamily('Arial');

      var tLeadsC = '=COUNTIFS(Leads!$Y$2:$Y;~' + campanha + '~;Leads!$D$2:$D;~?*~)';
      aq.getRange(linhaC, 2).setFormula(montarFormula_(tLeadsC, sep));

      var tScoreC = '=IFERROR(AVERAGEIFS(Leads!$W$2:$W;Leads!$Y$2:$Y;~' + campanha + '~;Leads!$D$2:$D;~?*~);0)';
      aq.getRange(linhaC, 3).setFormula(montarFormula_(tScoreC, sep));
      aq.getRange(linhaC, 3).setNumberFormat('0' + ASPAS + '/100' + ASPAS);

      var tPatrC = '=IFERROR(AVERAGEIFS(Leads!$L$2:$L;Leads!$Y$2:$Y;~' + campanha + '~;Leads!$D$2:$D;~?*~);0)';
      aq.getRange(linhaC, 4).setFormula(montarFormula_(tPatrC, sep));
      aq.getRange(linhaC, 4).setNumberFormat(FORMATO_MOEDA_INTEIRO);
    }
    aq.getRange(linhaHeader2, 1, campanhas.length + 1, 4)
      .setBorder(true, true, true, true, true, true, '#DDDDDD', SpreadsheetApp.BorderStyle.SOLID);
  }

  return aq;
}

// ================================================================
// ABA "Priorizacao de Leads"
// ================================================================
function construirPriorizacao_(ss, sep) {
  var existente = ss.getSheetByName('Priorizacao de Leads');
  if (existente) { ss.deleteSheet(existente); }
  var pr = ss.insertSheet('Priorizacao de Leads');
  pr.setHiddenGridlines(true);
  pr.setColumnWidths(1, 10, 120);

  estilizarTitulo_(pr, 'FINCARE - Priorizacao Comercial de Leads', null);

  var linhaHeader = 3;
  pr.getRange(linhaHeader, 1, 1, 10).setValues([[
    'Data', 'Nome', 'E-mail', 'Patrimonio', 'Aporte/mes', 'Objetivo', 'Assessor?', 'Score', 'PRIORIDADE', 'Instituicao'
  ]]);
  pr.getRange(linhaHeader, 1, 1, 10)
    .setBackground('#1F2A44').setFontColor('#FFFFFF').setFontWeight('bold').setFontFamily('Arial');
  pr.setFrozenRows(linhaHeader);

  var linhaDados = linhaHeader + 1;
  var criterioValido = 'Leads!$D$2:$D<>~~';

  function filtro(colunaOrigem) {
    return 'FILTER(Leads!$' + colunaOrigem + '$2:$' + colunaOrigem + ';' + criterioValido + ')';
  }

  pr.getRange(linhaDados, 1).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('AD') + ';~~))', sep));
  pr.getRange(linhaDados, 1, pr.getMaxRows() - linhaDados + 1, 1).setNumberFormat('dd/mm/yyyy');

  pr.getRange(linhaDados, 2).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('B') + ';~~))', sep));
  pr.getRange(linhaDados, 3).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('D') + ';~~))', sep));

  pr.getRange(linhaDados, 4).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('L') + ';~~))', sep));
  pr.getRange(linhaDados, 4, pr.getMaxRows() - linhaDados + 1, 1).setNumberFormat(FORMATO_MOEDA_INTEIRO);

  pr.getRange(linhaDados, 5).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('M') + ';~~))', sep));
  pr.getRange(linhaDados, 5, pr.getMaxRows() - linhaDados + 1, 1).setNumberFormat(FORMATO_MOEDA_INTEIRO);

  pr.getRange(linhaDados, 6).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('K') + ';~~))', sep));
  pr.getRange(linhaDados, 7).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('I') + ';~~))', sep));

  pr.getRange(linhaDados, 8).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('W') + ';~~))', sep));
  pr.getRange(linhaDados, 8, pr.getMaxRows() - linhaDados + 1, 1).setNumberFormat('0' + ASPAS + '/100' + ASPAS);

  // PRIORIDADE = patrimonio (peso 45%, capado em 5 milhoes) + aporte
  // (peso 35%, capado em 20 mil/mes) + 20 pontos extras se nao tiver
  // assessor. MIN() nao funciona elemento a elemento dentro de
  // ARRAYFORMULA (sempre reduz a um unico numero) - por isso o teto de
  // cada razao e feito com IF(razao>1;1;razao), que e seguro em array.
  var refL = filtro('L');
  var refM = filtro('M');
  var refI = filtro('I');
  var razaoPatr = '(' + refL + '/5000000)';
  var razaoAporte = '(' + refM + '/20000)';
  var templatePrioridade =
    '=ARRAYFORMULA(IFERROR(ROUND(' +
    'IF(' + razaoPatr + '>1;1;' + razaoPatr + ')*45+' +
    'IF(' + razaoAporte + '>1;1;' + razaoAporte + ')*35+' +
    'IF(' + refI + '=~nao~;20;0)' +
    ';0);~~))';
  pr.getRange(linhaDados, 9).setFormula(montarFormula_(templatePrioridade, sep));

  pr.getRange(linhaDados, 10).setFormula(montarFormula_('=ARRAYFORMULA(IFERROR(' + filtro('H') + ';~~))', sep));

  var regraCor = SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpointWithValue('#87A96B', SpreadsheetApp.InterpolationType.NUMBER, '100')
    .setGradientMidpointWithValue('#E9C46A', SpreadsheetApp.InterpolationType.NUMBER, '50')
    .setGradientMinpointWithValue('#E76F51', SpreadsheetApp.InterpolationType.NUMBER, '0')
    .setRanges([pr.getRange(linhaDados, 9, pr.getMaxRows() - linhaDados + 1, 1)])
    .build();
  pr.setConditionalFormatRules([regraCor]);

  return pr;
}

// ================================================================
// ABA "Como Usar"
// ================================================================
function construirComoUsar_(ss) {
  var existente = ss.getSheetByName('Como Usar');
  if (existente) { ss.deleteSheet(existente); }
  var doc = ss.insertSheet('Como Usar');
  doc.setHiddenGridlines(true);
  doc.setColumnWidth(1, 220);
  doc.setColumnWidth(2, 560);

  estilizarTitulo_(doc, 'FINCARE - Como Usar Esta Planilha', null);

  var linhas = [
    ['Como o webhook alimenta',
     'O simulador do site grava um lead novo por linha na aba Leads, sempre nas colunas A ate AE (31 colunas), incluindo AD (perfil_investidor) e AE (estado). O script nunca escreve nas colunas AF (data_real) e AG (lead_valido) - essas sao calculadas automaticamente pela planilha.'],
    ['Perfil de investidor (coluna AD)',
     'Classificacao de referencia (Ultraconservador, Conservador, Moderado ou Dinamico) calculada no simulador com base na metodologia de perfis do Safra Report, a partir da faixa de patrimonio/renda, do slider de rentabilidade-alvo e de possuir ou nao assessor/gerente bancario. E uma estimativa para priorizacao comercial, nao substitui o enquadramento oficial de perfil feito por um assessor.'],
    ['Estado (coluna AE)',
     'Sigla da UF que o lead selecionou no site, ao lado do campo Cidade. Ajuda a identificar rapidamente de onde o lead esta testando, sem depender so do texto livre da cidade.'],
    ['Colunas auxiliares (AF e AG)',
     'AF (data_real) converte o texto de data/hora da coluna A numa data de verdade, formatada dd/mm/aaaa. AG (lead_valido) marca 1 quando o lead tem e-mail preenchido (coluna D), vazio quando nao tem. Sao formulas ARRAYFORMULA unicas na linha 2 que se expandem sozinhas conforme novas linhas chegam.'],
    ['O que e lead valido',
     'Lead valido = tem e-mail preenchido. Todas as metricas do Dashboard, Aquisicao e Priorizacao contam apenas leads validos, para nao misturar linhas de teste/lixo com dados reais.'],
    ['Escala do Score Patrimonial',
     'A coluna W (score_patrimonial) vai de 0 a 100. No Dashboard, o KPI Score Patrimonial Medio divide por 100 para mostrar como porcentagem (0.0%). Na tabela de distribuicao por faixas, os numeros 0-20-40-60-80-100 sao usados direto, sem dividir, porque a coluna W ja esta nessa escala.'],
    ['Aba Aquisicao',
     'As celulas com fundo amarelo na tabela Por Canal sao editaveis - digite ali os valores exatos de utm_source que voce usa nos links de anuncio (ex: instagram, facebook, google). A tabela Por Campanha detecta sozinha os valores de utm_campaign que ja apareceram nos leads.'],
    ['Aba Priorizacao de Leads',
     'Lista so com leads que tem e-mail, uma linha por lead. A coluna PRIORIDADE (0 a 100) pondera patrimonio (45%), aporte mensal (35%) e da +20 pontos pra quem ainda nao tem assessor (oportunidade de conversao). Para ordenar do lead mais quente pro mais frio, clique na coluna PRIORIDADE e use Dados > Classificar intervalo (decrescente).'],
    ['Categorias novas no futuro',
     'As tabelas de distribuicao (faixa de patrimonio, faixa de renda, objetivo) e a lista de campanhas na aba Aquisicao sao montadas a partir dos valores que existem nos dados no momento em que voce roda o item de menu Construir/atualizar estrutura de analise completa. Se uma categoria nova aparecer depois (ex: um objetivo novo no site), rode esse item do menu de novo para ela aparecer nas tabelas.'],
    ['Proxima melhoria sugerida',
     'Vale adicionar uma coluna STATUS do lead (novo / contatado / reuniao marcada / cliente / perdido), preenchida manualmente pelo time comercial. Isso permite medir taxa de conversao real por canal (aba Aquisicao) e por faixa de prioridade, nao so volume de leads.']
  ];

  var linhaAtual = 3;
  linhas.forEach(function (par) {
    doc.getRange(linhaAtual, 1).setValue(par[0])
      .setFontWeight('bold').setFontFamily('Arial').setFontColor('#1F2A44').setVerticalAlignment('top');
    doc.getRange(linhaAtual, 2).setValue(par[1])
      .setFontFamily('Arial').setWrap(true).setVerticalAlignment('top');
    doc.setRowHeight(linhaAtual, 60);
    linhaAtual++;
  });

  doc.getRange(3, 1, linhas.length, 2)
    .setBorder(true, true, true, true, true, true, '#DDDDDD', SpreadsheetApp.BorderStyle.SOLID);
}

// ================================================================
// ORQUESTRADOR - constroi/reconstroi tudo, na ordem certa
// ================================================================
function construirEstruturaAnalitica() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var leadsSheet = getLeadsSheet_();
  var sep = getSeparador_();

  configurarColunasAuxiliares_(leadsSheet, sep);
  var dash = construirDashboard_(ss, leadsSheet, sep);
  var aq = construirAquisicao_(ss, leadsSheet, sep);
  var pr = construirPriorizacao_(ss, sep);
  construirComoUsar_(ss);
  var doc = ss.getSheetByName('Como Usar');

  leadsSheet.activate(); ss.moveActiveSheet(1);
  dash.activate(); ss.moveActiveSheet(2);
  aq.activate(); ss.moveActiveSheet(3);
  pr.activate(); ss.moveActiveSheet(4);
  doc.activate(); ss.moveActiveSheet(5);

  leadsSheet.activate();
}

// ================================================================
// MENU DENTRO DA PLANILHA (Extensoes > Fincare, apos recarregar a pagina)
// ================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Fincare')
    .addItem('Construir/atualizar estrutura de analise completa', 'construirEstruturaAnalitica')
    .addItem('Reformatar planilha de Leads', 'formatarTodasAsLinhas')
    .addToUi();
}
