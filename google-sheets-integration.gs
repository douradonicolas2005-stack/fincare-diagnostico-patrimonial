/**
 * FINCARE INVESTIMENTOS — Recebe os leads do Diagnóstico Patrimonial e
 * grava uma linha por envio numa planilha do Google Sheets.
 *
 * COMO USAR:
 * 1. Crie (ou abra) uma planilha em sheets.google.com.
 * 2. Menu Extensões → Apps Script.
 * 3. Apague o conteúdo padrão e cole este arquivo inteiro.
 * 4. Salve (ícone de disquete).
 * 5. Implantar → Nova implantação → tipo "App da Web".
 *    - Executar como: Eu (seu e-mail)
 *    - Quem pode acessar: Qualquer pessoa
 * 6. Clique em Implantar e autorize as permissões pedidas pelo Google
 *    (vai aparecer um aviso de app não verificado — clique em
 *    "Avançado" → "Acessar [nome do projeto] (não seguro)", é normal
 *    para scripts que você mesmo escreveu/colou).
 * 7. Copie a URL gerada (termina em /exec) e envie pra mim — eu conecto
 *    essa URL no site.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  const headers = [
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

  const row = headers.map(function (h) {
    const v = data[h];
    return (v === undefined || v === null) ? '' : v;
  });
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
