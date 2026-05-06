/**
 * Calcula a média de consumo por tipo baseado no histórico
 */
export const calcularMediaHistorica = (consumos, tipo) => {
  if (!consumos || consumos.length === 0) return 0;
  
  const consumosDoTipo = consumos.filter(c => 
    c.tipoConsumo.toLowerCase().includes(tipo.toLowerCase())
  );
  
  if (consumosDoTipo.length === 0) return 0;
  
  const soma = consumosDoTipo.reduce((acc, curr) => acc + curr.valor, 0);
  return soma / consumosDoTipo.length;
};

/**
 * Identifica se um valor representa uma anomalia (ex: 30% acima da média)
 */
export const detectarAnomalia = (valorAtual, mediaHistorica, threshold = 1.3) => {
  if (mediaHistorica === 0) return false;
  return valorAtual > (mediaHistorica * threshold);
};

/**
 * Converte valor de energia (kWh) para emissão de CO2 (aproximado)
 */
export const calcularCO2 = (kWh) => {
  return (kWh * 0.09).toFixed(2); // kg de CO2
};

/**
 * Converte economia de água para "árvores salvas" (simbólico)
 */
export const calcularImpactoVerde = (litrosEconomizados) => {
  return (litrosEconomizados / 500).toFixed(1);
};

/**
 * Sugere uma meta de economia baseada na média (ex: reduzir 10%)
 */
export const sugerirMeta = (mediaHistorica) => {
  if (mediaHistorica <= 0) return 0;
  return (mediaHistorica * 0.9).toFixed(2);
};

/**
 * Calcula o Eco-Score (0-100) baseado no cumprimento das metas
 */
export const calcularEcoScore = (dadosConsumo) => {
  const { energia, agua, residuos, metaEnergiaVal, metaAguaVal, metaGasVal } = dadosConsumo;
  
  let scores = [];
  
  if (metaEnergiaVal > 0) scores.push(Math.max(0, 100 - (energia / metaEnergiaVal * 50)));
  if (metaAguaVal > 0) scores.push(Math.max(0, 100 - (agua / metaAguaVal * 50)));
  if (metaGasVal > 0) scores.push(Math.max(0, 100 - (residuos / metaGasVal * 50)));
  
  if (scores.length === 0) return 100; // Começa perfeito!
  
  const total = scores.reduce((a, b) => a + b, 0);
  return Math.round(total / scores.length);
};
