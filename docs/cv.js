let dadosCV = {};
let idiomaAtual = 'pt';

// Função para mostrar/esconder loading
function toggleLoading(show) {
  const loading = document.getElementById('main-loading');
  const content = document.getElementById('main-content');

  if (show) {
    loading.style.display = 'flex';
    content.style.display = 'none';
  } else {
    loading.style.display = 'none';
    content.style.display = 'grid';
  }
}

// Função para carregar dados do JSON baseado no idioma
async function carregarDadosJSON(idioma = 'pt') {
  const arquivo = idioma === 'pt' ? 'cv.json' : 'cv.en.json';
  console.log(`Tentando carregar ${arquivo}...`);

  // Mostrar loading
  toggleLoading(true);

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

    // Esconder loading
    toggleLoading(false);

  } catch (error) {
    console.error(`Erro ao carregar ${arquivo}:`, error);
    // Em caso de erro, ainda esconde o loading
    toggleLoading(false);
  }
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

  // Habilidades técnicas
  const habilidadesUl = document.getElementById('habilidades');
  habilidadesUl.innerHTML = '';
  dadosCV.habilidades.forEach(item => {
    habilidadesUl.innerHTML += `<li>${item}</li>`;
  });

  // Certificações
  const certificacoesUl = document.getElementById('certificacoes');
  certificacoesUl.innerHTML = '';
  dadosCV.certificacoes.forEach(item => {
    certificacoesUl.innerHTML += `<li>${item}</li>`;
  });

  // Projetos com links
  const projetosUl = document.getElementById('projetos');
  projetosUl.innerHTML = '';
  dadosCV.projetos.forEach(projeto => {
    if (typeof projeto === 'object' && projeto.nome) {
      let projetoHTML = `<li>
        <strong><a href="${projeto.link}" target="_blank" rel="noopener">${projeto.nome}</a></strong>`;

      if (projeto.descricao) {
        projetoHTML += `<br><span style="font-size: 0.9em; color: var(--text-color); opacity: 0.8;">${projeto.descricao}</span>`;
      }

      projetoHTML += `</li>`;
      projetosUl.innerHTML += projetoHTML;
    } else {
      projetosUl.innerHTML += `<li>${projeto}</li>`;
    }
  });
}

// Função para atualizar títulos das seções baseado no idioma
function atualizarTitulos() {
  if (dadosCV.secoes) {
    document.getElementById('resumo-title').textContent = dadosCV.secoes.resumo;
    document.getElementById('experiencia-title').textContent = dadosCV.secoes.experiencia;
    document.getElementById('habilidades-title').textContent = dadosCV.secoes.habilidades;
    document.getElementById('formacao-title').textContent = dadosCV.secoes.formacao;
    document.getElementById('certificacoes-title').textContent = dadosCV.secoes.certificacoes;
    document.getElementById('projetos-title').textContent = dadosCV.secoes.projetos;
  }
}

// Função para trocar idioma
function trocarIdioma(idioma) {
  idiomaAtual = idioma;
  carregarDadosJSON(idioma);

  // Atualizar idioma da interface também
  if (typeof trocarIdiomaInterface === 'function') {
    trocarIdiomaInterface(idioma);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
  console.log('CV.js carregado, iniciando...');
  carregarDadosJSON('pt');
});