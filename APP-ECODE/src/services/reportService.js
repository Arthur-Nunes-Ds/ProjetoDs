import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateConsumptionReport = async (consumos, usuario) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #26D0CE; padding-bottom: 20px; }
          h1 { color: #1A2980; margin: 0; }
          .user-info { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f1f5f9; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; }
          .summary { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; borderRadius: 10px; }
          .summary-item { text-align: center; flex: 1; }
          .summary-value { font-size: 20px; font-weight: bold; color: #1A2980; }
          .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Consumo ECODE</h1>
          <p>Sustentabilidade e Gestão Inteligente</p>
        </div>
        
        <div class="user-info">
          <p><strong>Usuário:</strong> ${usuario?.nome || 'Não identificado'}</p>
          <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Registros</div>
            <div class="summary-value">${consumos.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${consumos.map(item => `
              <tr>
                <td>${new Date(item.dataRegistrada).toLocaleDateString('pt-BR')}</td>
                <td>${item.tipoConsumo}</td>
                <td>${item.valor} ${item.tipoConsumo.toLowerCase().includes('agua') ? 'L' : (item.tipoConsumo.toLowerCase().includes('energia') ? 'kWh' : 'kg')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo aplicativo ECODE.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.log('Erro ao gerar PDF:', error);
    throw error;
  }
};
