import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = '3306',
} = process.env;

if (!DB_HOST || !DB_USER || DB_NAME == null || DB_NAME === '') {
  throw new Error('Missing database environment variables. Please define DB_HOST, DB_USER, and DB_NAME.');
}

const baseConfig = {
  host: DB_HOST === 'localhost' ? '127.0.0.1' : DB_HOST,
  user: DB_USER,
  ...(DB_PASSWORD ? { password: DB_PASSWORD } : {}),
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const ensureDatabase = async () => {
  const initPool = mysql.createPool({ ...baseConfig });
  await initPool.execute(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await initPool.end();
};

await ensureDatabase();

const pool = mysql.createPool({
  ...baseConfig,
  database: DB_NAME,
});

const STUDENT_TABLE = 'students';
const EXPERT_TABLE = 'experts';

const createTables = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ${STUDENT_TABLE} (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role VARCHAR(32) NOT NULL DEFAULT 'student',
      registeredAt VARCHAR(255) NOT NULL,
      status VARCHAR(64) NOT NULL DEFAULT 'active',
      lastUpdated VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS \`${EXPERT_TABLE}\` (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      specialization VARCHAR(255) NOT NULL,
      experience VARCHAR(255) NOT NULL,
      fee DECIMAL(12,2) NOT NULL DEFAULT 0,
      location VARCHAR(255) NOT NULL,
      expertEmail VARCHAR(255) NOT NULL UNIQUE,
      ownerEmail VARCHAR(255) NOT NULL,
      status VARCHAR(64) NOT NULL DEFAULT 'pending',
      imageUrl LONGTEXT,
      availableSlots TEXT,
      description TEXT,
      createdAt VARCHAR(255) NOT NULL,
      approvedAt VARCHAR(255),
      rejectedAt VARCHAR(255),
      deletedAt VARCHAR(255),
      lastUpdated VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const parseRow = (row) => row;

const toStringValue = (value) => (value === null || value === undefined ? '' : String(value));

export const getStudents = async () => {
  const [rows] = await pool.query(`SELECT * FROM \`${STUDENT_TABLE}\``);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    registeredAt: row.registeredAt,
    status: row.status,
    lastUpdated: row.lastUpdated,
  }));
};

export const getExperts = async () => {
  const [rows] = await pool.query(`SELECT * FROM \`${EXPERT_TABLE}\``);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    experience: row.experience,
    fee: Number(row.fee || 0),
    location: row.location,
    expertEmail: row.expertEmail,
    ownerEmail: row.ownerEmail,
    status: row.status,
    imageUrl: row.imageUrl,
    availableSlots: row.availableSlots ? row.availableSlots.split(',').map((slot) => slot.trim()) : [],
    description: row.description,
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
    rejectedAt: row.rejectedAt,
    deletedAt: row.deletedAt,
    lastUpdated: row.lastUpdated,
  }));
};

export const saveStudent = async (student) => {
  const now = student.lastUpdated || new Date().toISOString();
  await pool.execute(
    `INSERT INTO \`${STUDENT_TABLE}\` (id, name, email, role, registeredAt, status, lastUpdated)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       email = VALUES(email),
       role = VALUES(role),
       registeredAt = VALUES(registeredAt),
       status = VALUES(status),
       lastUpdated = VALUES(lastUpdated)`,
    [
      student.id,
      student.name,
      student.email,
      student.role || 'student',
      student.registeredAt || new Date().toISOString(),
      student.status || 'active',
      now,
    ]
  );
  return { ...student, lastUpdated: now };
};

export const saveExpert = async (expert) => {
  const now = expert.lastUpdated || new Date().toISOString();
  const availableSlots = Array.isArray(expert.availableSlots)
    ? expert.availableSlots.join(', ')
    : toStringValue(expert.availableSlots);

  await pool.execute(
    `INSERT INTO \`${EXPERT_TABLE}\` (
      id, name, specialization, experience, fee, location, expertEmail, ownerEmail,
      status, imageUrl, availableSlots, description, createdAt, approvedAt,
      rejectedAt, deletedAt, lastUpdated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       specialization = VALUES(specialization),
       experience = VALUES(experience),
       fee = VALUES(fee),
       location = VALUES(location),
       expertEmail = VALUES(expertEmail),
       ownerEmail = VALUES(ownerEmail),
       status = VALUES(status),
       imageUrl = VALUES(imageUrl),
       availableSlots = VALUES(availableSlots),
       description = VALUES(description),
       createdAt = VALUES(createdAt),
       approvedAt = VALUES(approvedAt),
       rejectedAt = VALUES(rejectedAt),
       deletedAt = VALUES(deletedAt),
       lastUpdated = VALUES(lastUpdated)`,
    [
      expert.id,
      expert.name,
      expert.specialization,
      expert.experience,
      expert.fee ?? 0,
      expert.location,
      expert.expertEmail || expert.email || '',
      expert.ownerEmail || expert.expertEmail || '',
      expert.status || 'pending',
      expert.imageUrl || '',
      availableSlots,
      expert.description || '',
      expert.createdAt || new Date().toISOString(),
      expert.approvedAt || null,
      expert.rejectedAt || null,
      expert.deletedAt || null,
      now,
    ]
  );

  return { ...expert, lastUpdated: now, availableSlots: availableSlots.split(',').map((slot) => slot.trim()) };
};

export const updateExpert = async (expert) => {
  return saveExpert(expert);
};

const getExpertById = async (expertId) => {
  const [rows] = await pool.query(`SELECT * FROM ${EXPERT_TABLE} WHERE id = ? LIMIT 1`, [expertId]);
  return rows[0] || null;
};

export const updateExpertStatus = async (expertId, statusUpdate) => {
  const existing = await getExpertById(expertId);
  if (!existing) {
    throw new Error('Expert not found');
  }

  const merged = {
    id: existing.id,
    name: existing.name,
    specialization: existing.specialization,
    experience: existing.experience,
    fee: Number(existing.fee || 0),
    location: existing.location,
    expertEmail: existing.expertEmail,
    ownerEmail: existing.ownerEmail,
    status: statusUpdate.status || existing.status,
    imageUrl: existing.imageUrl,
    availableSlots: existing.availableSlots,
    description: existing.description,
    createdAt: existing.createdAt,
    approvedAt: statusUpdate.approvedAt ?? existing.approvedAt,
    rejectedAt: statusUpdate.rejectedAt ?? existing.rejectedAt,
    deletedAt: statusUpdate.deletedAt ?? existing.deletedAt,
    lastUpdated: new Date().toISOString(),
  };

  return saveExpert(merged);
};

await createTables();
