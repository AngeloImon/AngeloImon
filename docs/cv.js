let dadosCV = {};
let idiomaAtual = 'pt';

// Função para carregar dados do JSON
async function carregarDadosJSON() {
  console.log('Tentando carregar cv.json...');
  try {
    const response = await fetch('cv.json');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    dadosCV = await response.json();
    console.log('JSON carregado com sucesso:', dadosCV);
    
    // Carregar dados após processar o JSON
    carregarDados();
    atualizarTitulos();
    
  } catch (error) {
    console.error('Erro ao carregar cv.json:', error);
  }
}

// Função para trocar idioma
function trocarIdioma(idioma) {
  idiomaAtual = idioma;
  carregarDados();
  atualizarTitulos();
}

// Função para carregar dados na página
function carregarDados() {
  if (!dadosCV.nome) return;
  
  document.getElementById('nome').textContent = dadosCV.nome;
  document.getElementById('email').textContent = dadosCV.email;
  document.getElementById('github').href = dadosCV.links.github;
  document.getElementById('linkedin').href = dadosCV.links.linkedin;
  document.getElementById('resumo').textContent = dadosCV.resumo;
  document.getElementById('formacao').textContent = dadosCV.formacao;
  
  // Experiência
  const expDiv = document.getElementById('experiencia');
  expDiv.innerHTML = '';
  dadosCV.experiencia.forEach(exp => {
    const expElement = document.createElement('div');
    expElement.innerHTML = `
      <h3>${exp.cargo}</h3>
      <p><strong>${exp.empresa}</strong> | ${exp.periodo}</p>
      <div style="margin-left: 20px;">
        ${exp.tarefas.map(tarefa => `<p>• ${tarefa}</p>`).join('')}
      </div>
      <br>
    `;
    expDiv.appendChild(expElement);
  });
  
  // Listas (habilidades, certificações, projetos)
  ['habilidades', 'certificacoes', 'projetos'].forEach(secao => {
    const ul = document.getElementById(secao);
    ul.innerHTML = '';
    dadosCV[secao].forEach(item => {
      ul.innerHTML += `<li>${item}</li>`;
    });
  });
}

// Função para atualizar títulos (só português por enquanto)
function atualizarTitulos() {
  // Títulos já estão no HTML
}

// Inicializar
document.addEventListener('DOMContentLoaded', carregarDadosJSON);