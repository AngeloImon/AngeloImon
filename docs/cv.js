let dadosCV = {};
let idiomaAtual = 'pt';

// Função para carregar dados do JSON
async function carregarDadosJSON() {
  try {
    const response = await fetch('./cv.json');
    const dadosBase = await response.json();
    
    // Criar versões bilíngues
    dadosCV = {
      pt: {
        ...dadosBase,
        github: dadosBase.links.github,
        linkedin: dadosBase.links.linkedin,
        secoes: {
          resumo: "Resumo",
          experiencia: "Experiência Profissional",
          habilidades: "Habilidades Técnicas",
          formacao: "Formação",
          certificacoes: "Certificações",
          projetos: "Projetos"
        }
      },
      en: {
        ...dadosBase,
        github: dadosBase.links.github,
        linkedin: dadosBase.links.linkedin,
        resumo: "Developer transitioning to technology, studying ADS at FATEC-RP. Fluent in English (TOEIC 945). Solid experience in technical support, customer service and credit analysis...",
        formacao: "Technology in Systems Analysis and Development – FATEC-RP (2022–2025)",
        secoes: {
          resumo: "Summary",
          experiencia: "Professional Experience",
          habilidades: "Technical Skills",
          formacao: "Education",
          certificacoes: "Certifications",
          projetos: "Projects"
        }
      }
    };
    
    carregarDados();
    atualizarTitulos();
    
  } catch (error) {
    console.error('Erro ao carregar JSON:', error);
    console.log('Use um servidor local para evitar problemas de CORS');
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