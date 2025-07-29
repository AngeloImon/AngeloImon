// Dados do currículo em diferentes idiomas (baseado no JSON)
let dadosCV = {};
let idiomaAtual = 'pt';

// Função para carregar dados do JSON
async function carregarDadosJSON() {
  try {
    const response = await fetch('cv.json');
    const dadosBase = await response.json();
    
    // Criar estrutura bilíngue baseada no JSON
    dadosCV = {
      pt: {
        nome: dadosBase.nome,
        email: dadosBase.email,
        github: dadosBase.links.github,
        linkedin: dadosBase.links.linkedin,
        resumo: dadosBase.resumo,
        experiencia: dadosBase.experiencia.map(exp => ({
          cargo: exp.cargo,
          empresa: exp.empresa,
          periodo: exp.periodo,
          descricao: exp.tarefas.join(' • ')
        })),
        habilidades: dadosBase.habilidades,
        formacao: dadosBase.formacao,
        certificacoes: dadosBase.certificacoes,
        projetos: dadosBase.projetos,
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
        nome: dadosBase.nome,
        email: dadosBase.email,
        github: dadosBase.links.github,
        linkedin: dadosBase.links.linkedin,
        resumo: "Developer transitioning to technology, studying ADS at FATEC-RP. Fluent in English (TOEIC 945). Experience in technical support, customer service and credit. Projects with Python, SQL, OpenCV and Git. I deliver empathetic solutions focused on value.",
        experiencia: dadosBase.experiencia.map(exp => ({
          cargo: exp.cargo,
          empresa: exp.empresa,
          periodo: exp.periodo,
          descricao: exp.tarefas.join(' • ')
        })),
        habilidades: dadosBase.habilidades,
        formacao: "Technology in Systems Analysis and Development – FATEC-RP (2022–2025)",
        certificacoes: dadosBase.certificacoes,
        projetos: [
          "Titanic Classifier – Machine Learning with Scikit-learn",
          "Image Processing – OpenCV + Matplotlib", 
          "RSA Cryptosystem – Python and Modular Arithmetic",
          "Shift Optimization – Linear Programming with Gurobi"
        ],
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
    
    // Carregar dados após receber do JSON
    carregarDados();
    atualizarTitulos();
    
  } catch (error) {
    console.error('Erro ao carregar cv.json:', error);
    // Fallback com dados básicos
    usarDadosFallback();
  }
}

// Função para trocar idioma
function trocarIdioma(idioma) {
  idiomaAtual = idioma;
  carregarDados();
  atualizarTitulos();
  
  // Atualizar idioma do documento
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en-US';
}

// Função para carregar os dados na página
function carregarDados() {
  if (!dadosCV[idiomaAtual]) {
    console.log('Dados ainda não carregados...');
    return;
  }
  
  const dados = dadosCV[idiomaAtual];
  
  // Informações básicas
  document.getElementById('nome').textContent = dados.nome;
  document.getElementById('email').textContent = dados.email;
  document.getElementById('github').href = dados.github;
  document.getElementById('linkedin').href = dados.linkedin;
  
  // Resumo
  document.getElementById('resumo').textContent = dados.resumo;
  
  // Experiência
  const experienciaDiv = document.getElementById('experiencia');
  experienciaDiv.innerHTML = '';
  dados.experiencia.forEach(exp => {
    const expDiv = document.createElement('div');
    expDiv.innerHTML = `
      <h3>${exp.cargo}</h3>
      <p><strong>${exp.empresa}</strong> | ${exp.periodo}</p>
      <p>${exp.descricao}</p>
      <br>
    `;
    experienciaDiv.appendChild(expDiv);
  });
  
  // Habilidades
  const habilidadesUl = document.getElementById('habilidades');
  habilidadesUl.innerHTML = '';
  dados.habilidades.forEach(habilidade => {
    const li = document.createElement('li');
    li.textContent = habilidade;
    habilidadesUl.appendChild(li);
  });
  
  // Formação
  document.getElementById('formacao').textContent = dados.formacao;
  
  // Certificações
  const certificacoesUl = document.getElementById('certificacoes');
  certificacoesUl.innerHTML = '';
  dados.certificacoes.forEach(cert => {
    const li = document.createElement('li');
    li.textContent = cert;
    certificacoesUl.appendChild(li);
  });
  
  // Projetos
  const projetosUl = document.getElementById('projetos');
  projetosUl.innerHTML = '';
  dados.projetos.forEach(projeto => {
    const li = document.createElement('li');
    li.textContent = projeto;
    projetosUl.appendChild(li);
  });
}

// Função para atualizar títulos das seções
function atualizarTitulos() {
  if (!dadosCV[idiomaAtual]) return;
  
  const secoes = dadosCV[idiomaAtual].secoes;
  const titulos = document.querySelectorAll('main section h2');
  
  if (titulos.length >= 6) {
    titulos[0].textContent = secoes.resumo;
    titulos[1].textContent = secoes.experiencia;
    titulos[2].textContent = secoes.habilidades;
    titulos[3].textContent = secoes.formacao;
    titulos[4].textContent = secoes.certificacoes;
    titulos[5].textContent = secoes.projetos;
  }
}

// Dados de fallback caso o JSON não carregue
function usarDadosFallback() {
  console.log('Usando dados de fallback...');
  dadosCV = {
    pt: {
      nome: "Angelo Ferdinand Imon Spanó",
      email: "angeloimon@outlook.com",
      github: "https://github.com/AngeloImon",
      linkedin: "https://linkedin.com/in/angelo-ferdinand-imon-spano",
      resumo: "Erro ao carregar dados do JSON. Verifique o arquivo cv.json.",
      experiencia: [],
      habilidades: ["Erro ao carregar"],
      formacao: "Erro ao carregar dados",
      certificacoes: ["Erro ao carregar"],
      projetos: ["Erro ao carregar"],
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
      nome: "Angelo Ferdinand Imon Spanó",
      email: "angeloimon@outlook.com", 
      github: "https://github.com/AngeloImon",
      linkedin: "https://linkedin.com/in/angelo-ferdinand-imon-spano",
      resumo: "Error loading JSON data. Check cv.json file.",
      experiencia: [],
      habilidades: ["Error loading"],
      formacao: "Error loading data",
      certificacoes: ["Error loading"],
      projetos: ["Error loading"],
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
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, carregando dados do JSON...');
  carregarDadosJSON();
});

// Fallback adicional
window.addEventListener('load', function() {
  if (!document.getElementById('nome').textContent) {
    console.log('Tentativa adicional de carregamento...');
    carregarDadosJSON();
  }
});