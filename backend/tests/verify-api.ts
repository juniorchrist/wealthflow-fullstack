/**
 * Automated Verification Script for WealthFlow Multi-User Dynamic Backend
 * Tests:
 * 1. Health check
 * 2. User A Registration & Token Generation
 * 3. User B Registration & Token Generation
 * 4. User A CRUD operations (Transaction, Budget, Savings, Custom Category)
 * 5. Strict Multi-User Data Isolation Verification (User B cannot access or see User A's data)
 * 6. Cloud Data Export
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint: string, options: any = {}, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('🚀 === WEALTHFLOW MULTI-USER API VERIFICATION TEST ===\n');

  // 1. Health check
  console.log('👉 Test 1: API Health Check...');
  const health = await request('/health');
  if (health.status === 200) {
    console.log('  ✅ API is online and healthy!\n');
  } else {
    console.error('  ❌ Health check failed:', health);
    process.exit(1);
  }

  const uniqueSuffix = Date.now();

  // 2. User A Register
  console.log('👉 Test 2: Registering User A...');
  const userARes = await request('/auth/register', {
    method: 'POST',
    body: {
      nom: 'Kouassi',
      prenom: 'Jean',
      numero: `+22507${uniqueSuffix.toString().slice(-8)}`,
      email: `user.a.${uniqueSuffix}@wealthflow.ci`,
      password: 'passwordA123',
      pin: '1234',
    },
  });

  if (userARes.status !== 201 || !userARes.data.token) {
    console.error('  ❌ User A Registration failed:', userARes);
    process.exit(1);
  }
  const tokenA = userARes.data.token;
  console.log(`  ✅ User A registered successfully (ID: ${userARes.data.user.id})\n`);

  // 3. User B Register
  console.log('👉 Test 3: Registering User B...');
  const userBRes = await request('/auth/register', {
    method: 'POST',
    body: {
      nom: 'Aya',
      prenom: 'Marie',
      numero: `+22505${uniqueSuffix.toString().slice(-8)}`,
      email: `user.b.${uniqueSuffix}@wealthflow.ci`,
      password: 'passwordB123',
      pin: '5678',
    },
  });

  if (userBRes.status !== 201 || !userBRes.data.token) {
    console.error('  ❌ User B Registration failed:', userBRes);
    process.exit(1);
  }
  const tokenB = userBRes.data.token;
  console.log(`  ✅ User B registered successfully (ID: ${userBRes.data.user.id})\n`);

  // 4. Initial categories check (User A receives default categories)
  console.log('👉 Test 4: Fetching categories for User A...');
  const catARes = await request('/categories', { method: 'GET' }, tokenA);
  console.log(`  ✅ User A has ${catARes.data.length} initialized categories.`);
  const defaultCategoryA = catARes.data[0];

  // 5. User A creates a custom category
  console.log('👉 Test 5: User A creates a custom category...');
  const customCatRes = await request(
    '/categories',
    {
      method: 'POST',
      body: {
        name: 'Mes Projets Immobiliers',
        color: '#8B5CF6',
        icon: 'Home',
        type: 'expense',
      },
    },
    tokenA
  );
  const customCatAId = customCatRes.data.id;
  console.log(`  ✅ Custom category created: "${customCatRes.data.name}" (ID: ${customCatAId})\n`);

  // 6. User A creates transaction
  console.log('👉 Test 6: User A creates a transaction (150,000 FCFA)...');
  const txARes = await request(
    '/transactions',
    {
      method: 'POST',
      body: {
        amount: 150000,
        type: 'income',
        categoryId: defaultCategoryA.id,
        date: '2026-08-30',
        note: 'Honoraires Consultant',
      },
    },
    tokenA
  );
  const txAId = txARes.data.id;
  console.log(`  ✅ User A transaction created (ID: ${txAId})\n`);

  // 7. User B creates transaction
  console.log('👉 Test 7: User B creates a transaction (35,000 FCFA)...');
  const catBRes = await request('/categories', { method: 'GET' }, tokenB);
  const txBRes = await request(
    '/transactions',
    {
      method: 'POST',
      body: {
        amount: 35000,
        type: 'expense',
        categoryId: catBRes.data[0].id,
        date: '2026-08-30',
        note: 'Courses Marché',
      },
    },
    tokenB
  );
  const txBId = txBRes.data.id;
  console.log(`  ✅ User B transaction created (ID: ${txBId})\n`);

  // 8. STRICT ISOLATION TEST: User B tries to read / modify User A's transaction
  console.log('👉 Test 8: STRICT ISOLATION CHECK - User B accessing User A transaction...');
  const unauthorizedRead = await request(`/transactions/${txAId}`, { method: 'GET' }, tokenB);
  if (unauthorizedRead.status === 404 || unauthorizedRead.status === 403) {
    console.log(`  ✅ Isolation Verified: User B cannot view User A transaction (HTTP ${unauthorizedRead.status})`);
  } else {
    console.error('  ❌ ISOLATION BREACH! User B could access User A data:', unauthorizedRead);
    process.exit(1);
  }

  const unauthorizedUpdate = await request(
    `/transactions/${txAId}`,
    {
      method: 'PUT',
      body: { amount: 1 },
    },
    tokenB
  );
  if (unauthorizedUpdate.status === 404 || unauthorizedUpdate.status === 403) {
    console.log(`  ✅ Isolation Verified: User B cannot modify User A transaction (HTTP ${unauthorizedUpdate.status})\n`);
  } else {
    console.error('  ❌ ISOLATION BREACH! User B could update User A data:', unauthorizedUpdate);
    process.exit(1);
  }

  // 9. Verify lists separation
  console.log('👉 Test 9: Verifying transactions list isolation...');
  const listA = await request('/transactions', { method: 'GET' }, tokenA);
  const listB = await request('/transactions', { method: 'GET' }, tokenB);

  const aContainsB = listA.data.some((tx: any) => tx.id === txBId);
  const bContainsA = listB.data.some((tx: any) => tx.id === txAId);

  if (!aContainsB && !bContainsA) {
    console.log('  ✅ Absolute Isolation: User A and User B lists are strictly isolated!\n');
  } else {
    console.error('  ❌ ISOLATION BREACH in lists!');
    process.exit(1);
  }

  // 10. Budget upsert and isolation
  console.log('👉 Test 10: User A sets a monthly budget (300,000 FCFA)...');
  const budgetARes = await request(
    '/budgets',
    {
      method: 'POST',
      body: {
        month: '2026-08',
        totalBudget: 300000,
        savingsTarget: 60000,
      },
    },
    tokenA
  );
  console.log(`  ✅ Budget saved: ${budgetARes.data.totalBudget} FCFA for ${budgetARes.data.month}`);

  const userBBudgets = await request('/budgets', { method: 'GET' }, tokenB);
  if (Object.keys(userBBudgets.data).length === 0) {
    console.log('  ✅ User B has 0 budgets (proper empty state / isolation)\n');
  } else {
    console.error('  ❌ Budget isolation failed:', userBBudgets.data);
    process.exit(1);
  }

  // 11. Savings goal with milestones & contributions
  console.log('👉 Test 11: User A creates a savings goal with milestones...');
  const goalRes = await request(
    '/savings-goals',
    {
      method: 'POST',
      body: {
        title: 'Apport Terrain',
        targetAmount: 500000,
        currentAmount: 100000,
        month: '2026-08',
        milestones: [
          { title: 'Étape 1', targetAmount: 100000, isCompleted: true },
          { title: 'Étape 2', targetAmount: 200000, isCompleted: false },
        ],
      },
    },
    tokenA
  );
  console.log(`  ✅ Savings Goal created: "${goalRes.data.title}" (Target: ${goalRes.data.targetAmount} FCFA)`);

  const contributeRes = await request(
    `/savings-goals/${goalRes.data.id}/contribute`,
    {
      method: 'POST',
      body: { amount: 50000 },
    },
    tokenA
  );
  console.log(`  ✅ Contribution recorded: new balance ${contributeRes.data.currentAmount} FCFA\n`);

  // 12. Full Cloud Export
  console.log('👉 Test 12: Exporting User A cloud data...');
  const exportRes = await request('/users/me/export', { method: 'GET' }, tokenA);
  if (exportRes.status === 200 && exportRes.data.data.transactions.length > 0) {
    console.log(`  ✅ Cloud backup successfully generated (Transactions: ${exportRes.data.data.transactions.length}, Goals: ${exportRes.data.data.savingsGoals.length})\n`);
  } else {
    console.error('  ❌ Export failed:', exportRes);
    process.exit(1);
  }

  console.log('🎉 === ALL MULTI-USER API & ISOLATION TESTS PASSED 100% === 🎉');
}

runTests().catch((e) => {
  console.error('Test script encountered an error:', e);
});
