let dadosCV = {};
let idiomaAtual = 'pt';

// Função para carregar dados do JSON baseado no idioma
async function carregarDadosJSON(idioma = 'pt') {
  const arquivo = idioma === 'pt' ? 'cv.json' : 'cv.en.json';
  console.log(`Tentando carregar ${arquivo}...`);
  
  try {
    const response = await fetch(arquivo, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
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
    console.error(`Erro ao carregar ${arquivo}:`, error);
  }
}

// Função para trocar idioma
function trocarIdioma(idioma) {
  idiomaAtual = idioma;
  carregarDadosJSON(idioma);
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
  ['habilidades', 'certificacoes'].forEach(secao => {
    const ul = document.getElementById(secao);
    ul.innerHTML = '';
    dadosCV[secao].forEach(item => {
      ul.innerHTML += `<li>${item}</li>`;
    });
  });

  // Projetos com descrições e links
    const projetosUl = document.getElementById('projetos');
    projetosUl.innerHTML = '';
    dadosCV.projetos.forEach(projeto => {
      if (typeof projeto === 'object' && projeto.nome) {
        // Novo formato com nome, descrição e link
        let projetoHTML = `<li>
          <strong><a href="${projeto.link}" target="_blank" rel="noopener">${projeto.nome}</a></strong>`;
        
        if (projeto.descricao) {
          projetoHTML += `<br><span style="font-size: 0.9em; color: #666;">${projeto.descricao}</span>`;
        }
        
        projetoHTML += `</li>`;
        projetosUl.innerHTML += projetoHTML;
      } else {
        // Formato antigo (string simples) - para compatibilidade
        projetosUl.innerHTML += `<li>${projeto}</li>`;
      }
    });
  }

// Função para atualizar títulos
function atualizarTitulos() {
  if (!dadosCV.secoes) return;
  
  const secoes = dadosCV.secoes;
  const titulos = document.querySelectorAll('main section h2');
  
  titulos[0].textContent = secoes.resumo;
  titulos[1].textContent = secoes.experiencia;
  titulos[2].textContent = secoes.habilidades;
  titulos[3].textContent = secoes.formacao;
  titulos[4].textContent = secoes.certificacoes;
  titulos[5].textContent = secoes.projetos;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => carregarDadosJSON('pt'));