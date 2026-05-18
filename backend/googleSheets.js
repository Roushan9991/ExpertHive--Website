import { google } from 'googleapis';

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
if (!spreadsheetId) {
  throw new Error('Missing GOOGLE_SHEET_ID environment variable.');
}

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const STUDENT_SHEET = 'Students';
const EXPERT_SHEET = 'Experts';

const STUDENT_HEADER = ['ID', 'Name', 'Email', 'Role', 'RegisteredAt', 'Status', 'LastUpdated'];
const EXPERT_HEADER = [
  'ID',
  'Name',
  'Specialization',
  'Experience',
  'Fee',
  'Location',
  'Email',
  'OwnerEmail',
  'Status',
  'ImageUrl',
  'AvailableSlots',
  'Description',
  'CreatedAt',
  'ApprovedAt',
  'RejectedAt',
  'DeletedAt',
  'LastUpdated',
];

const SHEET_HEADERS = {
  [STUDENT_SHEET]: STUDENT_HEADER,
  [EXPERT_SHEET]: EXPERT_HEADER,
};

const ensureHeader = async (sheetName) => {
  const header = SHEET_HEADERS[sheetName];
  if (!header) {
    throw new Error(`Unknown sheet name: ${sheetName}`);
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z1`,
  });

  const currentHeader = response.data.values?.[0] || [];
  if (!currentHeader.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [header] },
    });
  }
};

const getSheetValues = async (sheetName, range) => {
  await ensureHeader(sheetName);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${range}`,
  });
  return response.data.values || [];
};

const getSheetRowIndexById = async (sheetName, id) => {
  const rows = await getSheetValues(sheetName, 'A2:A');
  const rowIndex = rows.findIndex((row) => row[0] === id);
  return rowIndex >= 0 ? rowIndex + 2 : -1;
};

const appendSheetRow = async (sheetName, row) => {
  await ensureHeader(sheetName);
  return sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
};

const updateSheetRow = async (sheetName, rowNumber, row) => {
  return sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
};

const upsertSheetRow = async (sheetName, row, id) => {
  const rowNumber = await getSheetRowIndexById(sheetName, id);
  if (rowNumber >= 0) {
    await updateSheetRow(sheetName, rowNumber, row);
    return { updated: true, rowNumber };
  }

  await appendSheetRow(sheetName, row);
  return { appended: true };
};

const parseExpertRow = (row) => ({
  id: row[0] || '',
  name: row[1] || '',
  specialization: row[2] || '',
  experience: row[3] || '',
  fee: Number(row[4] || 0),
  location: row[5] || '',
  expertEmail: row[6] || '',
  ownerEmail: row[7] || '',
  status: row[8] || '',
  imageUrl: row[9] || '',
  availableSlots: row[10] ? row[10].split(',').map((slot) => slot.trim()) : [],
  description: row[11] || '',
  createdAt: row[12] || '',
  approvedAt: row[13] || '',
  rejectedAt: row[14] || '',
  deletedAt: row[15] || '',
  lastUpdated: row[16] || '',
});

const parseStudentRow = (row) => ({
  id: row[0] || '',
  name: row[1] || '',
  email: row[2] || '',
  role: row[3] || '',
  registeredAt: row[4] || '',
  status: row[5] || '',
  lastUpdated: row[6] || '',
});

const buildStudentRow = (student) => [
  student.id,
  student.name,
  student.email,
  student.role || 'student',
  student.registeredAt || new Date().toISOString(),
  student.status || 'active',
  student.lastUpdated || new Date().toISOString(),
];

const buildExpertRow = (expert) => [
  expert.id,
  expert.name,
  expert.specialization,
  expert.experience,
  String(expert.fee ?? 0),
  expert.location,
  expert.expertEmail || expert.email || '',
  expert.ownerEmail || expert.expertEmail || '',
  expert.status || 'pending',
  expert.imageUrl || '',
  Array.isArray(expert.availableSlots) ? expert.availableSlots.join(', ') : expert.availableSlots || '',
  expert.description || '',
  expert.createdAt || new Date().toISOString(),
  expert.approvedAt || '',
  expert.rejectedAt || '',
  expert.deletedAt || '',
  expert.lastUpdated || new Date().toISOString(),
];

export const getStudents = async () => {
  const values = await getSheetValues(STUDENT_SHEET, 'A2:Z');
  return values.map(parseStudentRow);
};

export const getExperts = async () => {
  const values = await getSheetValues(EXPERT_SHEET, 'A2:Z');
  return values.map(parseExpertRow);
};

export const saveStudent = async (student) => {
  const row = buildStudentRow(student);
  return upsertSheetRow(STUDENT_SHEET, row, student.id);
};

export const saveExpert = async (expert) => {
  const row = buildExpertRow(expert);
  return upsertSheetRow(EXPERT_SHEET, row, expert.id);
};

export const updateExpert = async (expert) => {
  return saveExpert(expert);
};

export const updateExpertStatus = async (expertId, statusUpdate) => {
  const rowNumber = await getSheetRowIndexById(EXPERT_SHEET, expertId);
  if (rowNumber < 0) {
    throw new Error('Expert not found');
  }

  const values = await getSheetValues(EXPERT_SHEET, `A${rowNumber}:Z${rowNumber}`);
  const existingRow = values[0] || [];
  const existing = parseExpertRow(existingRow);
  const merged = {
    ...existing,
    ...statusUpdate,
    lastUpdated: new Date().toISOString(),
  };

  const row = buildExpertRow(merged);
  await updateSheetRow(EXPERT_SHEET, rowNumber, row);
  return merged;
};
