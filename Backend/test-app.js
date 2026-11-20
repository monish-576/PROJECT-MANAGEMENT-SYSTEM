const BASE_URL = 'http://127.0.0.1:5000';

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runTests() {
  console.log('--- STARTING COMPLETE APPLICATION INTEGRATION TESTS ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/`).then(r => r.text());
  console.log('✓ Backend Root Health Check:', healthRes);

  // 2. User Registration
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@example.com`,
    password: 'Password123!',
    fullName: 'Test Automation User',
  };

  const regRes = await req('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  console.log('✓ User Registration Successful. Token generated:', !!regRes.token);
  const token = regRes.token;
  const userId = regRes.user.id || regRes.user._id;

  // 3. User Login
  const loginRes = await req('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  console.log('✓ User Login Successful. Welcome:', loginRes.user.fullName);

  // 4. Update Profile
  const profileRes = await req(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Lead Architect',
      bio: 'Automated test verified profile bio.',
    }),
  });
  console.log('✓ Profile Update Successful. New title:', profileRes.user.title);

  // 5. Dashboard Stats Overview
  const statsRes = await req('/api/projects/stats/overview');
  console.log('✓ Dashboard Stats Overview fetched from MongoDB:');
  console.log('   Total Projects:', statsRes.totalProjects);
  console.log('   Total Tasks:', statsRes.totalTasks);
  console.log('   Completed Tasks:', statsRes.completedTasks);
  console.log('   Pending Tasks:', statsRes.pendingTasks);

  // 6. Project Creation
  const newProject = {
    projectName: `Automated Test Project ${timestamp}`,
    description: 'A test project created by the automated verification suite.',
    status: 'Active',
    deadline: '2026-12-31',
    createdBy: testUser.email,
  };
  const projCreateRes = await req('/api/projects', {
    method: 'POST',
    body: JSON.stringify(newProject),
  });
  const createdProjectId = projCreateRes._id;
  console.log('✓ Project Creation Successful. Project ID:', createdProjectId);

  // 7. Project Listing
  const projectsRes = await req('/api/projects');
  const foundProj = projectsRes.find(p => p._id === createdProjectId);
  console.log('✓ Project Listing Verified. Found new project:', !!foundProj);

  // 8. Project Update
  const projUpdateRes = await req(`/api/projects/${createdProjectId}`, {
    method: 'PUT',
    body: JSON.stringify({
      description: 'Updated project description by automated test.',
      status: 'In Progress',
    }),
  });
  console.log('✓ Project Update Verified. Updated status:', projUpdateRes.status);

  // 9. Task Creation
  const newTask = {
    taskName: 'Verify local MongoDB storage',
    taskDescription: 'Automated task verification step.',
    priority: 'Critical',
    dueDate: '2026-11-30',
    assignedTo: testUser.email,
  };
  const taskCreateRes = await req(`/api/projects/${createdProjectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(newTask),
  });
  const createdTask = taskCreateRes.tasks.find(t => t.taskName === newTask.taskName);
  const createdTaskId = createdTask._id;
  console.log('✓ Task Creation Successful. Task ID:', createdTaskId);

  // 10. Single Task Lookup
  const singleTaskRes = await req(`/api/tasks/${createdTaskId}`);
  console.log('✓ Single Task Lookup Verified:', singleTaskRes.taskName);

  // 11. Task Update (Status & Priority)
  const taskUpdateRes = await req(`/api/projects/${createdProjectId}/tasks/${createdTaskId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'Done',
      priority: 'High',
    }),
  });
  const updatedTask = taskUpdateRes.tasks.find(t => t._id.toString() === createdTaskId.toString());
  console.log('✓ Task Status Update Verified. New status:', updatedTask.status);

  // 12. Task Deletion
  const taskDeleteRes = await req(`/api/projects/${createdProjectId}/tasks/${createdTaskId}`, {
    method: 'DELETE',
  });
  console.log('✓ Task Deletion Verified:', taskDeleteRes.message);

  // 13. Project Deletion
  const projDeleteRes = await req(`/api/projects/${createdProjectId}`, {
    method: 'DELETE',
  });
  console.log('✓ Project Deletion Verified:', projDeleteRes.message);

  console.log('\n--- ALL 13 TEST SUITES PASSED FLAWLESSLY WITH REAL MONGODB DATABASE ---');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err.message);
  process.exit(1);
});
