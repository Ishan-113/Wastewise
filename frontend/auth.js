// WasteWise Auth — connects to Java backend (MySQL)
const API_BASE = window.__WASTEWISE_API__ || 'http://localhost:8080';

const alertEl = document.getElementById('auth-alert');
const apiStatus = document.getElementById('api-status');
const tabs = document.querySelectorAll('.auth-tab');
const title = document.getElementById('auth-title');
const sub = document.getElementById('auth-sub');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

// Mobile menu (same as script.js)
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('mobile-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

function showAlert(msg, type = 'error') {
  alertEl.textContent = msg;
  alertEl.hidden = false;
  alertEl.className = 'auth-alert ' + type;
}
function clearAlert() {
  alertEl.hidden = true;
  alertEl.textContent = '';
}

function switchTab(tab) {
  tabs.forEach(t => {
    const active = t.dataset.tab === tab;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });
  const isLogin = tab === 'login';
  formLogin.classList.toggle('active', isLogin);
  formRegister.classList.toggle('active', !isLogin);
  title.textContent = isLogin ? 'Welcome back' : 'Create account';
  sub.textContent = isLogin ? 'Sign in to your WasteWise account' : 'Join WasteWise — recycle, earn, repeat';
  clearAlert();
}

tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
document.querySelectorAll('[data-switch]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.switch)));

// Show/hide password
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
  });
});

// API health check
async function checkHealth() {
  try {
    const r = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
    if (r.ok) {
      apiStatus.textContent = 'API online';
      apiStatus.className = 'api-status ok';
    } else {
      apiStatus.textContent = 'API unreachable';
      apiStatus.className = 'api-status err';
    }
  } catch {
    apiStatus.textContent = 'API offline (run backend)';
    apiStatus.className = 'api-status err';
  }
}
checkHealth();

async function postJSON(path, data) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  const btn = document.getElementById('login-btn');
  const fd = new FormData(formLogin);
  const email = String(fd.get('email') || '').trim();
  const password = String(fd.get('password') || '');
  if (!email || !password) return showAlert('Please fill all fields.');
  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span>Signing in…</span>';
  const { ok, body } = await postJSON('/api/auth/login', { email, password });
  btn.disabled = false;
  btn.innerHTML = orig;
  if (!ok) return showAlert(body.message || body.error || 'Login failed. Check email/password.');
  localStorage.setItem('wastewise_token', body.token || '');
  localStorage.setItem('wastewise_user', JSON.stringify(body.user || { email }));
  showAlert(`Welcome back, ${body.user?.name || email}! Redirecting…`, 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
});

formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  const btn = document.getElementById('register-btn');
  const fd = new FormData(formRegister);
  const name = String(fd.get('name') || '').trim();
  const email = String(fd.get('email') || '').trim();
  const password = String(fd.get('password') || '');
  if (!name || !email || !password) return showAlert('Please fill all fields.');
  if (password.length < 6) return showAlert('Password must be at least 6 characters.');
  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span>Creating…</span>';
  const { ok, body } = await postJSON('/api/auth/register', { name, email, password });
  btn.disabled = false;
  btn.innerHTML = orig;
  if (!ok) return showAlert(body.message || body.error || 'Registration failed.');
  localStorage.setItem('wastewise_token', body.token || '');
  localStorage.setItem('wastewise_user', JSON.stringify(body.user || { email, name }));
  showAlert('Account created! Redirecting…', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
});

// If hash #register -> open register tab
if (location.hash === '#register') switchTab('register');
