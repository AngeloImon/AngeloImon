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
    
    const dadosBase = await response.json();
    console.log('JSON carregado com sucesso:', dadosBase);
    
    // ...existing code...
    
  } catch (error) {
    console.error('Erro detalhado:', error);
    usarDadosEmbarcados();
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
  if (!dadosCV[idiomaAtual]) return;
  
  const dados = dadosCV[idiomaAtual];
  
  document.getElementById('nome').textContent = dados.nome;
  document.getElementById('email').textContent = dados.email;
  document.getElementById('github').href = dados.github;
  document.getElementById('linkedin').href = dados.linkedin;
  document.getElementById('resumo').textContent = dados.resumo;
  document.getElementById('formacao').textContent = dados.formacao;
  
  // Experiência
  const expDiv = document.getElementById('experiencia');
  expDiv.innerHTML = '';
  dados.experiencia.forEach(exp => {
    expDiv.innerHTML += `
      <div>
        <h3>${exp.cargo}</h3>
        <p><strong>${exp.empresa}</strong> | ${exp.periodo}</p>
        <p>${exp.tarefas.join(' • ')}</p><br>
      </div>
    `;
  });
  
  // Listas (habilidades, certificações, projetos)
  ['habilidades', 'certificacoes', 'projetos'].forEach(secao => {
    const ul = document.getElementById(secao);
    ul.innerHTML = '';
    dados[secao].forEach(item => {
      ul.innerHTML += `<li>${item}</li>`;
    });
  });
}

// Função para atualizar títulos
function atualizarTitulos() {
  if (!dadosCV[idiomaAtual]) return;
  
  const secoes = dadosCV[idiomaAtual].secoes;
  const titulos = document.querySelectorAll('main section h2');
  
  Object.values(secoes).forEach((titulo, i) => {
    if (titulos[i]) titulos[i].textContent = titulo;
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', carregarDadosJSON);