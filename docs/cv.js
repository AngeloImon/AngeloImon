// Dados do currículo em diferentes idiomas
const dadosCV = {
  pt: {
    nome: "Angelo Imon",
    email: "angelo.imon@email.com",
    github: "https://github.com/angeloimon",
    linkedin: "https://linkedin.com/in/angeloimon",
    resumo: "Desenvolvedor Full Stack com experiência em tecnologias modernas e paixão por criar soluções inovadoras.",
    experiencia: [
      {
        cargo: "Desenvolvedor Full Stack",
        empresa: "Empresa XYZ",
        periodo: "2023 - Presente",
        descricao: "Desenvolvimento de aplicações web usando React, Node.js e PostgreSQL."
      }
    ],
    habilidades: [
      "JavaScript/TypeScript",
      "React/Next.js",
      "Node.js",
      "Python",
      "PostgreSQL/MongoDB",
      "Git/GitHub"
    ],
    formacao: "Bacharelado em Ciência da Computação - Universidade ABC (2019-2023)",
    certificacoes: [
      "AWS Cloud Practitioner",
      "Google Analytics Certified"
    ],
    projetos: [
      "Sistema de Gestão - Aplicação web completa com dashboard administrativo",
      "API RESTful - Microserviços para e-commerce"
    ],
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
    nome: "Angelo Imon",
    email: "angelo.imon@email.com",
    github: "https://github.com/angeloimon",
    linkedin: "https://linkedin.com/in/angeloimon",
    resumo: "Full Stack Developer with experience in modern technologies and passion for creating innovative solutions.",
    experiencia: [
      {
        cargo: "Full Stack Developer",
        empresa: "XYZ Company",
        periodo: "2023 - Present",
        descricao: "Web application development using React, Node.js and PostgreSQL."
      }
    ],
    habilidades: [
      "JavaScript/TypeScript",
      "React/Next.js",
      "Node.js",
      "Python",
      "PostgreSQL/MongoDB",
      "Git/GitHub"
    ],
    formacao: "Bachelor in Computer Science - ABC University (2019-2023)",
    certificacoes: [
      "AWS Cloud Practitioner",
      "Google Analytics Certified"
    ],
    projetos: [
      "Management System - Complete web application with administrative dashboard",
      "RESTful API - Microservices for e-commerce"
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

// Idioma atual
let idiomaAtual = 'pt';

// Função para trocar idioma
function trocarIdioma(idioma) {
  idiomaAtual = idioma;
  carregarDados();
  atualizarTitulos();
  
  // Atualizar idioma do documento
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en-US';
}

// Função para carregar os dados
function carregarDados() {
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
  const secoes = dadosCV[idiomaAtual].secoes;
  const titulos = document.querySelectorAll('main section h2');
  
  titulos[0].textContent = secoes.resumo;
  titulos[1].textContent = secoes.experiencia;
  titulos[2].textContent = secoes.habilidades;
  titulos[3].textContent = secoes.formacao;
  titulos[4].textContent = secoes.certificacoes;
  titulos[5].textContent = secoes.projetos;
}

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  carregarDados();
});