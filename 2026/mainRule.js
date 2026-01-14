document.querySelectorAll('.js-section').forEach(section => {
  const btn = section.querySelector('.js-toggle');
  if (!btn) return;

  const defaultCollapsed = false;

  const contentNodes = Array.from(section.children).filter(el => !el.classList.contains('section-header'));
  const setCollapsed = (collapsed) => {
    contentNodes.forEach(el => el.style.display = collapsed ? 'none' : '');
    btn.textContent = collapsed ? '展開' : '收合';
    btn.setAttribute('aria-expanded', String(!collapsed));
  };

  setCollapsed(defaultCollapsed);

  btn.addEventListener('click', () => {
    const isCollapsed = contentNodes[0] && contentNodes[0].style.display === 'none';
    setCollapsed(!isCollapsed);
  });
});
