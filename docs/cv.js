function carregarCV(data) {
  // Campos simples
  const nome = document.getElementById('nome');
  nome.textContent = data.nome || '';

  const email = document.getElementById('email');
  email.textContent = '';
  if (data.email) email.textContent = data.email;

  const resumo = document.getElementById('resumo');
  resumo.textContent = data.resumo || '';

  const formacao = document.getElementById('formacao');
  formacao.textContent = data.formacao || '';

  const github = document.getElementById('github');
  github.href = data.links?.github || '#';

  const linkedin = document.getElementById('linkedin');
  linkedin.href = data.links?.linkedin || '#';

  // Listas dinâmicas
  const habilidades = document.getElementById('habilidades');
  habilidades.innerHTML = '';
  (data.habilidades || []).forEach(h => {
    const li = document.createElement('li');
    li.textContent = h;
    habilidades.appendChild(li);
  });

  const certificacoes = document.getElementById('certificacoes');
  certificacoes.innerHTML = '';
  (data.certificacoes || []).forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    certificacoes.appendChild(li);
  });

  const experiencia = document.getElementById('experiencia');
  experiencia.innerHTML = '';
  (data.experiencia || []).forEach(item => {
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = `${item.empresa} – ${item.cargo} (${item.periodo})`;
    div.appendChild(h3);

    const ul = document.createElement('ul');
    (item.tarefas || []).forEach(tarefa => {
      const li = document.createElement('li');
      li.textContent = tarefa;
      ul.appendChild(li);
    });

    div.appendChild(ul);
    experiencia.appendChild(div);
  });

  const projetos = document.getElementById('projetos');
  projetos.innerHTML = '';
  (data.projetos || []).forEach(proj => {
    const li = document.createElement('li');
    li.textContent = proj;
    projetos.appendChild(li);
  });
}

function trocarIdioma(idioma) {
  const arquivoBase = idioma === 'en' ? 'cv.en.json' : 'cv.json';
  const semCache = `${arquivoBase}?v=${new Date().getTime()}`;
  fetch(semCache)
    .then(res => res.json())
    .then(data => carregarCV(data))
    .catch(() => console.error('Erro ao carregar JSON'));
}

// ✅ Carrega o padrão português ao abrir
document.addEventListener('DOMContentLoaded', () => {
  trocarIdioma('pt');
});
