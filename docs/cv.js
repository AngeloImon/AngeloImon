function carregarCV(data) {
  // Campos simples
  document.getElementById('nome').textContent = data.nome || '';
  document.getElementById('contato').textContent = data.contato || '';
  document.getElementById('resumo').textContent = data.resumo || '';
  document.getElementById('formacao').textContent = data.formacao || '';
  document.getElementById('github').href = data.links?.github || '#';
  document.getElementById('linkedin').href = data.links?.linkedin || '#';

  // Listas e blocos — limpar antes
  const habilidades = document.getElementById('habilidades');
  habilidades.innerHTML = '';
  (data.habilidades || []).forEach(h => {
    const li = document.createElement('li');
    li.textContent = h;
    habilidades.appendChild(li);
  });

  const certs = document.getElementById('certificacoes');
  certs.innerHTML = '';
  (data.certificacoes || []).forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    certs.appendChild(li);
  });

  const exp = document.getElementById('experiencia');
  exp.innerHTML = '';
  (data.experiencia || []).forEach(item => {
    const block = document.createElement('div');
    const titulo = document.createElement('h3');
    titulo.textContent = `${item.empresa} – ${item.cargo} (${item.periodo})`;
    block.appendChild(titulo);

    const ul = document.createElement('ul');
    (item.tarefas || []).forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      ul.appendChild(li);
    });

    block.appendChild(ul);
    exp.appendChild(block);
  });

  const proj = document.getElementById('projetos');
  proj.innerHTML = '';
  (data.projetos || []).forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    proj.appendChild(li);
  });
}
