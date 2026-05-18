import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getStudents,
  getExperts,
  saveStudent,
  saveExpert,
  updateExpert,
  updateExpertStatus,
} from './mysqlDb.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/students', async (req, res) => {
  try {
    const students = await getStudents();
    return res.json({ data: students });
  } catch (error) {
    console.error('Failed to load students from Google Sheets:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student?.id) {
      return res.status(400).json({ error: 'Student id is required.' });
    }
    const result = await saveStudent(student);
    return res.json({ data: result });
  } catch (error) {
    console.error('Failed to save student to Google Sheets:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/experts', async (req, res) => {
  try {
    const experts = await getExperts();
    return res.json({ data: experts });
  } catch (error) {
    console.error('Failed to load experts from Google Sheets:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/experts', async (req, res) => {
  try {
    const expert = req.body;
    if (!expert?.id) {
      return res.status(400).json({ error: 'Expert id is required.' });
    }
    const result = await saveExpert(expert);
    return res.json({ data: result });
  } catch (error) {
    console.error('Failed to save expert to Google Sheets:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/experts/:expertId', async (req, res) => {
  try {
    const expert = { ...req.body, id: req.params.expertId };
    const result = await updateExpert(expert);
    return res.json({ data: result });
  } catch (error) {
    console.error('Failed to update expert in Google Sheets:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/experts/:expertId/status', async (req, res) => {
  try {
    const statusUpdate = req.body;
    const result = await updateExpertStatus(req.params.expertId, statusUpdate);
    return res.json({ data: result });
  } catch (error) {
    console.error('Failed to update expert status in Google Sheets:', error);
    return res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Google Sheets backend listening on http://localhost:${port}`);
});
