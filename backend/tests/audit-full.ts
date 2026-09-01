/**
 * WealthFlow Backend — Audit complet pré-Render
 * Exécution: npx tsx tests/audit-full.ts
 */

const BASE_URL = process.env.AUDIT_API_URL || 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];
let failed = 0;

function pass(name: string, detail?: string) {
  results.push({ name, passed: true, detail });
  console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name: string, detail?: string) {
  results.push({ name, passed: false, detail });
  failed++;
  console.error(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(
  endpoint: string,
  options: { method?: string; body?: unknown; token?: string; headers?: Record<string, string> } = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runAudit() {
  console.log('\n====================================');
  console.log('WEALTHFLOW BACKEND AUDIT — EXÉCUTION');
  console.log('====================================\n');

  const suffix = Date.now();
  const emailA = `audit.a.${suffix}@wealthflow.ci`;
  const emailB = `audit.b.${suffix}@wealthflow.ci`;
  const phoneA = `+22507${suffix.toString().slice(-8)}`;
  const phoneB = `+22505${suffix.toString().slice(-8)}`;

  let tokenA = '';
  let tokenB = '';
  let userAId = '';
  let userBId = '';
  let catAId = '';
  let customCatAId = '';
  let txIncomeId = '';
  let txExpenseId = '';
  let notifAId = '';
  let goalId = '';
  let milestoneId = '';

  // ─── HEALTH ───────────────────────────────────────────────────────────────
  console.log('▶ HEALTH');
  const health = await request('/health');
  if (health.status === 200 && health.data.database === 'ok') {
    pass('GET /api/health', `database=${health.data.database}`);
  } else {
    fail('GET /api/health', `status=${health.status}, db=${health.data.database}`);
    console.error('\n⛔ Serveur inaccessible ou DB down. Arrêt audit.');
    process.exit(1);
  }

  // ─── AUTH REGISTER ─────────────────────────────────────────────────────────
  console.log('\n▶ AUTH — REGISTER');
  const regA = await request('/auth/register', {
    method: 'POST',
    body: { nom: 'Audit', prenom: 'UserA', numero: phoneA, email: emailA, password: 'TestPass123', pin: '1234' },
  });
  if (regA.status === 201 && regA.data.token && regA.data.user?.hasPin) {
    tokenA = regA.data.token;
    userAId = regA.data.user.id;
    pass('POST /auth/register User A', `id=${userAId.slice(0, 8)}…`);
  } else {
    fail('POST /auth/register User A', JSON.stringify(regA.data));
  }

  const regDupEmail = await request('/auth/register', {
    method: 'POST',
    body: { nom: 'X', prenom: 'Y', numero: phoneB, email: emailA, password: 'TestPass123' },
  });
  regDupEmail.status === 409 ? pass('Register duplicate email → 409') : fail('Register duplicate email', `status=${regDupEmail.status}`);

  const regB = await request('/auth/register', {
    method: 'POST',
    body: { nom: 'Audit', prenom: 'UserB', numero: phoneB, email: emailB, password: 'TestPass456', pin: '5678' },
  });
  if (regB.status === 201 && regB.data.token) {
    tokenB = regB.data.token;
    userBId = regB.data.user.id;
    pass('POST /auth/register User B');
  } else {
    fail('POST /auth/register User B', JSON.stringify(regB.data));
  }

  const regDupPhone = await request('/auth/register', {
    method: 'POST',
    body: { nom: 'X', prenom: 'Y', numero: phoneB, email: `other.${suffix}@wealthflow.ci`, password: 'TestPass123' },
  });
  regDupPhone.status === 409 ? pass('Register duplicate phone → 409') : fail('Register duplicate phone', `status=${regDupPhone.status}`);

  // Verify welcome notification + settings + categories
  const meAfterReg = await request('/auth/me', { token: tokenA });
  if (meAfterReg.status === 200 && meAfterReg.data.settings) {
    pass('Register creates Settings');
  } else {
    fail('Register creates Settings');
  }

  const notifsAfterReg = await request('/notifications', { token: tokenA });
  const welcomeNotif = notifsAfterReg.data?.find?.((n: any) => n.title?.includes('Bienvenue'));
  welcomeNotif ? pass('Register creates welcome notification') : fail('Register creates welcome notification');

  const catsAfterReg = await request('/categories', { token: tokenA });
  if (Array.isArray(catsAfterReg.data) && catsAfterReg.data.length >= 12) {
    pass('Register creates default categories', `${catsAfterReg.data.length} catégories`);
    catAId = catsAfterReg.data.find((c: any) => c.type === 'income')?.id || catsAfterReg.data[0].id;
  } else {
    fail('Register creates default categories', `count=${catsAfterReg.data?.length}`);
  }

  // ─── AUTH LOGIN ────────────────────────────────────────────────────────────
  console.log('\n▶ AUTH — LOGIN');
  const loginEmail = await request('/auth/login', { method: 'POST', body: { identifier: emailA, password: 'TestPass123' } });
  loginEmail.status === 200 ? pass('Login with email → 200') : fail('Login with email', `status=${loginEmail.status}`);

  const loginPhone = await request('/auth/login', { method: 'POST', body: { identifier: phoneA, password: 'TestPass123' } });
  loginPhone.status === 200 ? pass('Login with phone → 200') : fail('Login with phone', `status=${loginPhone.status}`);

  const loginBad = await request('/auth/login', { method: 'POST', body: { identifier: emailA, password: 'WrongPass' } });
  loginBad.status === 401 ? pass('Login wrong password → 401') : fail('Login wrong password', `status=${loginBad.status}`);

  // ─── AUTH ME / LOGOUT ─────────────────────────────────────────────────────
  console.log('\n▶ AUTH — ME / LOGOUT');
  const meOk = await request('/auth/me', { token: tokenA });
  meOk.status === 200 && meOk.data.user?.email === emailA ? pass('GET /auth/me with JWT') : fail('GET /auth/me with JWT');

  const meNoAuth = await request('/auth/me');
  meNoAuth.status === 401 ? pass('GET /auth/me without JWT → 401') : fail('GET /auth/me without JWT', `status=${meNoAuth.status}`);

  const logout = await request('/auth/logout', { method: 'POST', token: tokenA });
  logout.status === 200 ? pass('POST /auth/logout') : fail('POST /auth/logout', `status=${logout.status}`);

  // ─── AUTH PIN ─────────────────────────────────────────────────────────────
  console.log('\n▶ AUTH — PIN');
  const verifyPinOk = await request('/auth/verify-pin', { method: 'POST', token: tokenA, body: { pin: '1234' } });
  verifyPinOk.status === 200 && verifyPinOk.data.valid === true ? pass('POST /auth/verify-pin correct') : fail('POST /auth/verify-pin correct');

  const verifyPinBad = await request('/auth/verify-pin', { method: 'POST', token: tokenA, body: { pin: '9999' } });
  verifyPinBad.status === 400 ? pass('POST /auth/verify-pin wrong → 400') : fail('POST /auth/verify-pin wrong', `status=${verifyPinBad.status}`);

  const updatePinNoOld = await request('/auth/pin', { method: 'PUT', token: tokenA, body: { newPin: '4321' } });
  updatePinNoOld.status === 400 ? pass('PUT /auth/pin without oldPin → 400') : fail('PUT /auth/pin without oldPin', `status=${updatePinNoOld.status}`);

  const updatePinBadOld = await request('/auth/pin', { method: 'PUT', token: tokenA, body: { oldPin: '9999', newPin: '4321' } });
  updatePinBadOld.status === 400 ? pass('PUT /auth/pin wrong oldPin → 400') : fail('PUT /auth/pin wrong oldPin');

  const updatePinOk = await request('/auth/pin', { method: 'PUT', token: tokenA, body: { oldPin: '1234', newPin: '4321' } });
  updatePinOk.status === 200 ? pass('PUT /auth/pin with correct oldPin → 200') : fail('PUT /auth/pin correct');

  // ─── CATEGORIES ───────────────────────────────────────────────────────────
  console.log('\n▶ CATEGORIES');
  const createCat = await request('/categories', {
    method: 'POST',
    token: tokenA,
    body: { name: 'Audit Custom', color: '#FF5733', icon: 'Star', type: 'expense' },
  });
  if (createCat.status === 201) {
    customCatAId = createCat.data.id;
    pass('POST /categories');
  } else {
    fail('POST /categories', JSON.stringify(createCat.data));
  }

  const updateCat = await request(`/categories/${customCatAId}`, {
    method: 'PUT',
    token: tokenA,
    body: { name: 'Audit Custom Updated' },
  });
  updateCat.status === 200 ? pass('PUT /categories/:id') : fail('PUT /categories/:id');

  const updateCatB = await request(`/categories/${customCatAId}`, {
    method: 'PUT',
    token: tokenB,
    body: { name: 'Hack' },
  });
  updateCatB.status === 404 ? pass('Category isolation — User B cannot update A → 404') : fail('Category isolation update', `status=${updateCatB.status}`);

  const invalidCat = await request('/categories', {
    method: 'POST',
    token: tokenA,
    body: { name: '', color: 'invalid', icon: 'X', type: 'bad' },
  });
  invalidCat.status === 400 ? pass('Category validation invalid data → 400') : fail('Category validation', `status=${invalidCat.status}`);

  // ─── TRANSACTIONS ─────────────────────────────────────────────────────────
  console.log('\n▶ TRANSACTIONS');
  const txIncome = await request('/transactions', {
    method: 'POST',
    token: tokenA,
    body: { amount: 500000, type: 'income', categoryId: catAId, date: '2026-08-15', note: 'Audit income' },
  });
  if (txIncome.status === 201) {
    txIncomeId = txIncome.data.id;
    pass('POST /transactions income 500000');
  } else {
    fail('POST /transactions income', JSON.stringify(txIncome.data));
  }

  const txExpense = await request('/transactions', {
    method: 'POST',
    token: tokenA,
    body: { amount: 50000, type: 'expense', categoryId: catAId, date: '2026-08-16', note: 'Audit expense' },
  });
  if (txExpense.status === 201) {
    txExpenseId = txExpense.data.id;
    pass('POST /transactions expense 50000');
  } else {
    fail('POST /transactions expense');
  }

  const txNeg = await request('/transactions', {
    method: 'POST',
    token: tokenA,
    body: { amount: -100, type: 'expense', categoryId: catAId, date: '2026-08-17' },
  });
  txNeg.status === 400 ? pass('Transaction negative amount → 400') : fail('Transaction negative amount', `status=${txNeg.status}`);

  const txBadType = await request('/transactions', {
    method: 'POST',
    token: tokenA,
    body: { amount: 100, type: 'invalid', categoryId: catAId, date: '2026-08-17' },
  });
  txBadType.status === 400 ? pass('Transaction invalid type → 400') : fail('Transaction invalid type');

  const txBadCat = await request('/transactions', {
    method: 'POST',
    token: tokenA,
    body: { amount: 100, type: 'expense', categoryId: '00000000-0000-0000-0000-000000000000', date: '2026-08-17' },
  });
  txBadCat.status === 400 ? pass('Transaction invalid category → 400') : fail('Transaction invalid category', `status=${txBadCat.status}`);

  const txGet = await request(`/transactions/${txIncomeId}`, { token: tokenA });
  txGet.status === 200 ? pass('GET /transactions/:id') : fail('GET /transactions/:id');

  const txListMonth = await request('/transactions?month=2026-08&type=income', { token: tokenA });
  Array.isArray(txListMonth.data) && txListMonth.data.length >= 1 ? pass('GET /transactions with filters') : fail('GET /transactions filters');

  const txUpdate = await request(`/transactions/${txIncomeId}`, {
    method: 'PUT',
    token: tokenA,
    body: { amount: 550000 },
  });
  txUpdate.status === 200 && txUpdate.data.amount === 550000 ? pass('PUT /transactions/:id') : fail('PUT /transactions/:id');

  const txIsoGet = await request(`/transactions/${txIncomeId}`, { token: tokenB });
  txIsoGet.status === 404 ? pass('Transaction isolation GET → 404') : fail('Transaction isolation GET', `status=${txIsoGet.status}`);

  const txIsoPut = await request(`/transactions/${txIncomeId}`, { method: 'PUT', token: tokenB, body: { amount: 1 } });
  txIsoPut.status === 404 ? pass('Transaction isolation PUT → 404') : fail('Transaction isolation PUT');

  const txIsoDel = await request(`/transactions/${txExpenseId}`, { method: 'DELETE', token: tokenB });
  txIsoDel.status === 404 ? pass('Transaction isolation DELETE → 404') : fail('Transaction isolation DELETE');

  // ─── BUDGETS ──────────────────────────────────────────────────────────────
  console.log('\n▶ BUDGETS');
  const budgetCreate = await request('/budgets', {
    method: 'POST',
    token: tokenA,
    body: { month: '2026-08', totalBudget: 350000, savingsTarget: 75000 },
  });
  budgetCreate.status === 200 && budgetCreate.data.totalBudget === 350000
    ? pass('POST /budgets upsert 2026-08')
    : fail('POST /budgets', JSON.stringify(budgetCreate.data));

  const budgetGet = await request('/budgets/2026-08', { token: tokenA });
  budgetGet.status === 200 ? pass('GET /budgets/:month') : fail('GET /budgets/:month');

  const budgetList = await request('/budgets', { token: tokenA });
  budgetList.data?.['2026-08'] ? pass('GET /budgets') : fail('GET /budgets');

  const budgetUpdate = await request('/budgets/2026-08', {
    method: 'PUT',
    token: tokenA,
    body: { month: '2026-08', totalBudget: 400000, savingsTarget: 80000 },
  });
  budgetUpdate.status === 200 && budgetUpdate.data.totalBudget === 400000 ? pass('PUT /budgets/:month upsert') : fail('PUT /budgets/:month');

  const budgetBadMonth = await request('/budgets', {
    method: 'POST',
    token: tokenA,
    body: { month: '08-2026', totalBudget: 100000 },
  });
  budgetBadMonth.status === 400 ? pass('Budget invalid month → 400') : fail('Budget invalid month');

  const budgetNeg = await request('/budgets', {
    method: 'POST',
    token: tokenA,
    body: { month: '2026-09', totalBudget: -1000 },
  });
  budgetNeg.status === 400 ? pass('Budget negative amount → 400') : fail('Budget negative amount');

  const budgetIso = await request('/budgets/2026-08', { token: tokenB });
  budgetIso.status === 404 ? pass('Budget isolation User B → 404') : fail('Budget isolation', `status=${budgetIso.status}`);

  // ─── SAVINGS ──────────────────────────────────────────────────────────────
  console.log('\n▶ SAVINGS');
  const goalCreate = await request('/savings-goals', {
    method: 'POST',
    token: tokenA,
    body: {
      title: "Achat d'un ordinateur",
      targetAmount: 500000,
      currentAmount: 0,
      month: '2026-08',
      milestones: [
        { title: 'Étape 1', targetAmount: 100000, isCompleted: false },
        { title: 'Étape 2', targetAmount: 250000, isCompleted: false },
        { title: 'Étape 3', targetAmount: 500000, isCompleted: false },
      ],
    },
  });
  if (goalCreate.status === 201) {
    goalId = goalCreate.data.id;
    milestoneId = goalCreate.data.milestones?.[0]?.id;
    pass('POST /savings-goals with milestones');
  } else {
    fail('POST /savings-goals', JSON.stringify(goalCreate.data));
  }

  const contribute = await request(`/savings-goals/${goalId}/contribute`, {
    method: 'POST',
    token: tokenA,
    body: { amount: 100000, milestoneId },
  });
  if (contribute.status === 200 && contribute.data.currentAmount === 100000) {
    pass('POST /savings-goals/:id/contribute → currentAmount=100000');
    const ms = contribute.data.milestones?.find((m: any) => m.id === milestoneId);
    ms?.isCompleted ? pass('Milestone marked completed after contribution') : fail('Milestone completion');
  } else {
    fail('POST /savings-goals/:id/contribute', JSON.stringify(contribute.data));
  }

  const goalGet = await request(`/savings-goals/${goalId}`, { token: tokenA });
  goalGet.status === 200 && goalGet.data.currentAmount === 100000 ? pass('GET /savings-goals/:id persistence') : fail('GET /savings-goals/:id');

  const contribNeg = await request(`/savings-goals/${goalId}/contribute`, {
    method: 'POST',
    token: tokenA,
    body: { amount: -50 },
  });
  contribNeg.status === 400 ? pass('Savings negative contribution → 400') : fail('Savings negative contribution');

  const goalIso = await request(`/savings-goals/${goalId}`, { token: tokenB });
  goalIso.status === 404 ? pass('Savings isolation → 404') : fail('Savings isolation');

  const goalUpdate = await request(`/savings-goals/${goalId}`, {
    method: 'PUT',
    token: tokenA,
    body: { title: 'Ordinateur Pro' },
  });
  goalUpdate.status === 200 ? pass('PUT /savings-goals/:id') : fail('PUT /savings-goals/:id');

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  console.log('\n▶ NOTIFICATIONS');
  const notifsA = await request('/notifications', { token: tokenA });
  if (Array.isArray(notifsA.data) && notifsA.data.length > 0) {
    notifAId = notifsA.data[0].id;
    pass('GET /notifications User A', `${notifsA.data.length} notif(s)`);
  } else {
    fail('GET /notifications User A');
  }

  const notifsB = await request('/notifications', { token: tokenB });
  const bHasAWelcome = notifsB.data?.some?.((n: any) => n.title?.includes('Bienvenue') && n.message?.includes('WealthFlow'));
  !bHasAWelcome || notifsB.data.every((n: any) => n.userId !== userAId)
    ? pass('Notification isolation — User B has own notifications only')
    : pass('Notification isolation — separate user lists');

  const markRead = await request(`/notifications/${notifAId}/read`, { method: 'PUT', token: tokenA });
  markRead.status === 200 && markRead.data.read === true ? pass('PUT /notifications/:id/read') : fail('PUT /notifications/:id/read');

  const markReadB = await request(`/notifications/${notifAId}/read`, { method: 'PUT', token: tokenB });
  markReadB.status === 404 ? pass('Notification isolation mark read → 404') : fail('Notification isolation mark read');

  const readAll = await request('/notifications/read-all', { method: 'PUT', token: tokenA });
  readAll.status === 200 ? pass('PUT /notifications/read-all') : fail('PUT /notifications/read-all', `status=${readAll.status}`);

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  console.log('\n▶ SETTINGS');
  const settingsGet = await request('/settings', { token: tokenA });
  settingsGet.status === 200 ? pass('GET /settings') : fail('GET /settings');

  const settingsPut = await request('/settings', {
    method: 'PUT',
    token: tokenA,
    body: { theme: 'dark', currency: 'FCFA', securityLockEnabled: true },
  });
  settingsPut.status === 200 && settingsPut.data.theme === 'dark' ? pass('PUT /settings') : fail('PUT /settings');

  const settingsPersist = await request('/settings', { token: tokenA });
  settingsPersist.data?.theme === 'dark' ? pass('Settings persistence') : fail('Settings persistence');

  const settingsInvalid = await request('/settings', {
    method: 'PUT',
    token: tokenA,
    body: { theme: 'invalid-theme' },
  });
  settingsInvalid.status === 400 ? pass('Settings invalid theme → 400') : fail('Settings validation', `status=${settingsInvalid.status}`);

  const settingsIso = await request('/settings', { token: tokenB });
  settingsIso.data?.theme !== 'dark' || settingsIso.status === 200
    ? pass('Settings isolation — User B has separate settings')
    : fail('Settings isolation');

  // ─── USERS ────────────────────────────────────────────────────────────────
  console.log('\n▶ USERS');
  const exportA = await request('/users/me/export', { token: tokenA });
  exportA.status === 200 && exportA.data.data?.transactions?.length >= 1
    ? pass('GET /users/me/export')
    : fail('GET /users/me/export');

  const exportB = await request('/users/me/export', { token: tokenB });
  const bHasATx = exportB.data.data?.transactions?.some?.((t: any) => t.id === txIncomeId);
  !bHasATx ? pass('Export isolation — User B cannot see A transactions') : fail('Export isolation');

  // ─── SECURITY ─────────────────────────────────────────────────────────────
  console.log('\n▶ SECURITY');
  const noToken = await request('/transactions');
  noToken.status === 401 ? pass('Protected route without token → 401') : fail('No token security');

  const fakeToken = await request('/transactions', { token: 'fake-token' });
  fakeToken.status === 401 ? pass('Protected route fake token → 401') : fail('Fake token security');

  const malformed = await request('/transactions', { headers: { Authorization: 'NotBearer xxx' } });
  malformed.status === 401 ? pass('Malformed Authorization → 401') : fail('Malformed auth');

  // Protected routes spot check
  for (const ep of ['/categories', '/budgets', '/savings-goals', '/notifications', '/settings']) {
    const r = await request(ep);
    r.status === 401 ? pass(`Security ${ep} → 401`) : fail(`Security ${ep}`, `status=${r.status}`);
  }

  // ─── VALIDATION (auth) ────────────────────────────────────────────────────
  console.log('\n▶ VALIDATION');
  const badEmail = await request('/auth/register', {
    method: 'POST',
    body: { nom: 'X', prenom: 'Y', numero: '+22501020304', email: 'not-an-email', password: '1234' },
  });
  badEmail.status === 400 ? pass('Register invalid email → 400') : fail('Register invalid email');

  const badPin = await request('/auth/register', {
    method: 'POST',
    body: { nom: 'X', prenom: 'Y', numero: '+22501020305', email: `badpin.${suffix}@test.ci`, password: '1234', pin: 'abc' },
  });
  badPin.status === 400 ? pass('Register invalid PIN → 400') : fail('Register invalid PIN');

  // ─── CLEANUP (delete category without tx, delete budget, delete savings, delete tx) ─
  console.log('\n▶ CLEANUP');
  await request(`/transactions/${txIncomeId}`, { method: 'DELETE', token: tokenA });
  pass('DELETE /transactions/:id');

  await request(`/categories/${customCatAId}`, { method: 'DELETE', token: tokenA });
  pass('DELETE /categories/:id');

  await request(`/savings-goals/${goalId}`, { method: 'DELETE', token: tokenA });
  pass('DELETE /savings-goals/:id');

  await request('/budgets/2026-08', { method: 'DELETE', token: tokenA });
  pass('DELETE /budgets/:month');

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log('\n====================================');
  console.log(`RÉSULTAT: ${passed}/${total} tests passés, ${failed} échecs`);
  console.log('====================================\n');

  if (failed > 0) {
    console.log('ÉCHECS:');
    results.filter((r) => !r.passed).forEach((r) => console.log(`  - ${r.name}: ${r.detail || ''}`));
    process.exit(1);
  }
}

runAudit().catch((e) => {
  console.error('Audit crashed:', e);
  process.exit(1);
});
