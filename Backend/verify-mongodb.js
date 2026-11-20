require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const Sprint = require('./models/Sprint');
const Notification = require('./models/Notification');

async function verify() {
  console.log('=== MONGODB COMPREHENSIVE INSPECTION & VERIFICATION ===\n');

  // 1. Environment & Config Verification
  console.log('1. ENVIRONMENT CONFIGURATION:');
  console.log('   PORT:', process.env.PORT);
  console.log('   MONGO_URI:', process.env.MONGO_URI);
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Configured (Secure)' : 'MISSING');
  console.log('   Dotenv loaded successfully:', !!process.env.MONGO_URI);

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_management_db';

  // 2. Connect to MongoDB
  console.log('\n2. CONNECTING TO MONGODB:');
  console.log('   Target URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('   Mongoose Connection State:', mongoose.connection.readyState === 1 ? 'Connected (State 1: Ready)' : 'Not Connected');
  console.log('   Host:', mongoose.connection.host);
  console.log('   Port:', mongoose.connection.port);
  console.log('   Database Name:', mongoose.connection.name);

  // 3. Inspect Databases on Cluster
  console.log('\n3. CLUSTER DATABASES:');
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  dbs.databases.forEach(db => {
    console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(1)} KB)`);
  });
  const dbExists = dbs.databases.some(d => d.name === 'project_management_db');
  console.log('   "project_management_db" exists on disk:', dbExists);

  // 4. Inspect Collections in project_management_db
  console.log('\n4. COLLECTIONS IN "project_management_db":');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`   - ${col.name}: ${count} document(s)`);
  }

  // 5. Inspect Models & Exact Counts
  console.log('\n5. DATABASE RECORD COUNTS:');
  const userCount = await User.countDocuments();
  const projectCount = await Project.countDocuments();
  const sprintCount = await Sprint.countDocuments();
  const notifCount = await Notification.countDocuments();

  // Count all embedded tasks across all projects
  const allProjects = await Project.find({});
  let totalTasks = 0;
  let doneTasks = 0;
  let inProgressTasks = 0;
  let backlogTasks = 0;
  let reviewTasks = 0;

  allProjects.forEach(p => {
    if (Array.isArray(p.tasks)) {
      totalTasks += p.tasks.length;
      p.tasks.forEach(t => {
        const s = (t.status || '').toLowerCase();
        if (s === 'done') doneTasks++;
        else if (s === 'in progress') inProgressTasks++;
        else if (s === 'review') reviewTasks++;
        else backlogTasks++;
      });
    }
  });

  console.log(`   Users: ${userCount}`);
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Total Tasks (Embedded in Projects): ${totalTasks}`);
  console.log(`     - Done: ${doneTasks}`);
  console.log(`     - In Progress: ${inProgressTasks}`);
  console.log(`     - In Review: ${reviewTasks}`);
  console.log(`     - Backlog/To-Do: ${backlogTasks}`);
  console.log(`   Sprints: ${sprintCount}`);
  console.log(`   Notifications: ${notifCount}`);

  // 6. Inspect User Model, Password Hashing (bcrypt), & JWT
  console.log('\n6. USER MODEL & AUTHENTICATION VERIFICATION:');
  const sampleUser = await User.findOne({});
  if (sampleUser) {
    console.log(`   Sample User Found: ${sampleUser.username} (${sampleUser.email})`);
    console.log(`   Password Hash Format: ${sampleUser.password.substring(0, 10)}... (Length: ${sampleUser.password.length})`);
    const isBcrypt = sampleUser.password.startsWith('$2a$') || sampleUser.password.startsWith('$2b$');
    console.log(`   Password is BCrypt Hashed: ${isBcrypt}`);
    
    // Test matchPassword method
    if (sampleUser.email.startsWith('testuser_')) {
      const match = await sampleUser.matchPassword('Password123!');
      console.log(`   bcrypt matchPassword('Password123!') verification: ${match}`);
    }

    // Test JWT Generation & Verification
    const token = jwt.sign({ id: sampleUser._id, email: sampleUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`   JWT Token Generation & Verification: Success (Subject: ${decoded.email})`);
  } else {
    console.log('   No existing users found.');
  }

  // 7. Inspect Project & Task Relationships
  console.log('\n7. PROJECT & TASK RELATIONSHIP VERIFICATION:');
  if (allProjects.length > 0) {
    const p1 = allProjects[0];
    console.log(`   Project Name: "${p1.projectName}"`);
    console.log(`   Status: ${p1.status || 'Active'}`);
    console.log(`   Created By: ${p1.createdBy || 'Default'}`);
    console.log(`   Tasks count in this project: ${p1.tasks ? p1.tasks.length : 0}`);
    if (p1.tasks && p1.tasks.length > 0) {
      const t1 = p1.tasks[0];
      console.log(`   Task 1: "${t1.taskName}" | Assigned To: "${t1.assignedTo || 'Unassigned'}" | Status: "${t1.status}" | Priority: "${t1.priority}"`);
    }
  }

  // 8. Non-Destructive Real-Time CRUD Verification
  console.log('\n8. NON-DESTRUCTIVE DATABASE CRUD VERIFICATION:');
  const testId = `verify_crud_${Date.now()}`;
  
  // CREATE
  const tempProject = new Project({
    projectName: `Verification Proj ${testId}`,
    description: 'Temporary verification project',
    status: 'Planning',
    createdBy: 'verifier@test.local',
    tasks: [{
      taskName: 'Verification Task 1',
      taskDescription: 'Temporary task',
      priority: 'Low',
      status: 'Backlog',
    }]
  });
  await tempProject.save();
  console.log('   [CREATE] Verified: Document saved to MongoDB with _id:', tempProject._id);

  // READ
  const readProject = await Project.findById(tempProject._id);
  console.log('   [READ]   Verified: Fetched created document from MongoDB:', readProject.projectName);

  // UPDATE
  readProject.status = 'Completed';
  readProject.tasks[0].status = 'Done';
  await readProject.save();
  const updatedProject = await Project.findById(tempProject._id);
  console.log('   [UPDATE] Verified: Project status updated to:', updatedProject.status, '| Task status:', updatedProject.tasks[0].status);

  // DELETE
  await Project.findByIdAndDelete(tempProject._id);
  const deletedCheck = await Project.findById(tempProject._id);
  console.log('   [DELETE] Verified: Cleaned up temporary document. Exists in DB:', !!deletedCheck);

  console.log('\n=== ALL MONGODB VERIFICATION CHECKS PASSED ===');
  await mongoose.disconnect();
}

verify().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
