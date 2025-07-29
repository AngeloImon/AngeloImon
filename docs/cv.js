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
    
    // Criar estrutura bilíngue baseada no JSON
    dadosCV = {
      pt: {
        nome: dadosBase.nome,
        email: dadosBase.email,
        github: dadosBase.links.github,
        linkedin: dadosBase.links.linkedin,
        resumo: dadosBase.resumo,
        experiencia: dadosBase.experiencia,
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
        resumo: "Developer transitioning to technology, studying ADS at FATEC-RP. Fluent in English (TOEIC 945). Solid experience in technical support, customer service and credit analysis. Developed practical projects focused on logic, data structures, automation and computer vision — applying Python, SQL, C++, Oracle DB and OpenCV. I integrate Git/GitHub and agile methodologies in project versioning and organization. My experiences with end users, sector management and communication contribute to empathetic technological solutions, clear and focused on value delivery. I'm ready to grow and collaborate in teams that value initiative, continuous learning and purposeful impact.",
        experiencia: [
          {
            empresa: "Foxtime",
            cargo: "Administrative Assistant I",
            periodo: "May/2021 – May/2022",
            tarefas: [
              "Analyzed credit and documentation for financing approval.",
              "Maintained internal databases using spreadsheets and enterprise systems.",
              "Developed commercial partnerships and led consultative insurance sales."
            ]
          },
          {
            empresa: "Museu da Gula",
            cargo: "Sales Associate / Department Lead",
            periodo: "Dec/2014 – Feb/2020",
            tarefas: [
              "Managed the spirits department, handling restocking, display, and inventory supervision.",
              "Delivered personalized service, increasing sales through direct recommendation.",
              "Trained staff, coordinated schedules, and supported leadership with goals and sales KPIs."
            ]
          },
          {
            empresa: "Fundamental TI",
            cargo: "Document Technician",
            periodo: "Nov/2013 – Dec/2014",
            tarefas: [
              "Digitized and classified official documents with accuracy and data integrity.",
              "Provided internal tech support for digital archive management.",
              "Structured files for indexing in internal systems, optimizing data retrieval."
            ]
          }
        ],
        habilidades: dadosBase.habilidades,
        formacao: "Technology in Systems Analysis and Development – FATEC-RP (2022–2025)",
        certificacoes: [
          "TOEIC - 945 points (2025)",
          "SAP/ABAP",
          "Oracle DB Design",
          "Oracle SQL",
          "Soft Skills for IT professionals",
          "Emotional Management & Self-Control",
          "Autonomous Vehicles Mini-Course",
          "Computer Vision with OpenCV"
        ],
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