// FINCARE INVESTIMENTOS - recebe os leads do Diagnostico Patrimonial e
// grava uma linha por envio numa planilha do Google Sheets.
//
// COMO USAR:
// 1. Crie (ou abra) uma planilha em sheets.google.com.
// 2. Menu Extensoes > Apps Script.
// 3. Apague o conteudo padrao e cole este arquivo inteiro.
// 4. Salve (icone de disquete).
// 5. Implantar > Nova implantacao > tipo "App da Web".
//    - Executar como: Eu (seu e-mail)
//    - Quem pode acessar: Qualquer pessoa
// 6. Clique em Implantar e autorize as permissoes pedidas pelo Google
//    (vai aparecer um aviso de app nao verificado - clique em
//    "Avancado" > "Acessar [nome do projeto] (nao seguro)", e normal
//    para scripts que voce mesmo escreveu/colou).
// 7. Copie a URL gerada (termina em /exec) e envie pra mim - eu conecto
//    essa URL no site.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  var headers = [
    'data', 'nome', 'telefone', 'email', 'cidade',
    'faixa_patrimonio', 'faixa_renda', 'instituicao_financeira_atual',
    'possui_assessor', 'possui_gerente_banco', 'objetivo_financeiro',
    'patrimonio_atual', 'aporte_mensal', 'renda_desejada', 'rentabilidade_esperada',
    'taxa_retirada', 'patrimonio_necessario', 'anos_ate_independencia', 'idade_atual',
    'diagnostico_avancado_fonte', 'diagnostico_avancado_patrimonio_liquido_adicional',
    'diagnostico_avancado_alocacao_por_classe', 'score_patrimonial',
    'origem_lead', 'utm_campaign', 'utm_source', 'utm_medium', 'utm_content', 'utm_term'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  var row = headers.map(function (h) {
    var v = data[h];
    return (v === undefined || v === null) ? '' : v;
  });
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
