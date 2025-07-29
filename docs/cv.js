// Dados hardcoded baseados no JSON (solução para problema de CORS)
const dadosBase = {
  "nome": "Angelo Ferdinand Imon Spanó",
  "email": "angeloimon@outlook.com",
  "links": {
    "github": "https://github.com/AngeloImon",
    "linkedin": "https://linkedin.com/in/angelo-ferdinand-imon-spano"
  },
  "resumo": "Desenvolvedor em transição para tecnologia, cursando ADS pela FATEC-RP. Fluente em inglês (TOEIC 945). Experiência em suporte técnico, atendimento e crédito. Projetos com Python, SQL, OpenCV e Git. Entrego soluções empáticas e com foco em valor.",
  "formacao": "Tecnólogo em Análise e Desenvolvimento de Sistemas – FATEC-RP (2022–2025)",
  "habilidades": ["Python", "C++", "PL/SQL", "Oracle DB", "Git/GitHub", "VS Code", "Google Colab"],
  "certificacoes": [
    "TOEIC - 945 pontos (2025)",
    "SAP/ABAP",
    "Oracle BD Design",
    "Oracle SQL",
    "Soft Skills fot IT professionals",
    "Emotional Management & Self-Control",
    "Autonomous Vehicles Mini-Course",
    "Computer Vision with OpenCV"
  ],
  "experiencia": [
    {
      "empresa": "Foxtime",
      "cargo": "Administrative Assistant I",
      "periodo": "mai/2021 – mai/2022",
      "tarefas": [
        "Analyzed credit and documentation for financing approval.",
        "Maintained internal databases using spreadsheets and enterprise systems.",
        "Developed commercial partnerships and led consultative insurance sales."
      ]
    },
    {
      "empresa": "Museu da Gula",
      "cargo": "Sales Associate / Department Lead",
      "periodo": "dez/2014 – fev/2020",
      "tarefas": [
        "Managed the spirits department, handling restocking, display, and inventory supervision.",
        "Delivered personalized service, increasing sales through direct recommendation.",
        "Trained staff, coordinated schedules, and supported leadership with goals and sales KPIs."
      ]
    },
    {
      "empresa": "Fundamental TI",
      "cargo": "Document Technician",
      "periodo": "nov/2013 – dez/2014",
      "tarefas": [
        "Digitized and classified official documents with accuracy and data integrity.",
        "Provided internal tech support for digital archive management.",
        "Structured files for indexing in internal systems, optimizing data retrieval."
      ]
    }
  ],
  "projetos": [
    "Classificador Titanic – Machine Learning com Scikit-learn",
    "Processamento de Imagens – OpenCV + Matplotlib",
    "Criptosistema RSA – Python e Aritmética Modular",
    "Otimização de Turnos – Programação Linear com Gurobi"
  ]
};

let dadosCV = {};
let idiomaAtual = 'pt';

// Função para inicializar dados
function inicializarDados() {
  // Criar estrutura bilíngue baseada nos dados
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
  
  // Carregar dados
  carregarDados();
  atualizarTitulos();
}

// ...existing code para trocarIdioma, carregarDados, atualizarTitulos...

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, inicializando dados...');
  inicializarDados();
});