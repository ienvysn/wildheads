const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large Base64 PDFs

// Get all patients
app.get('/api/patients', (req, res) => {
    db.all('SELECT * FROM patients ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get patient by PID
app.get('/api/patients/:pid', (req, res) => {
    const { pid } = req.params;
    db.get('SELECT * FROM patients WHERE pid = ?', [pid], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(row);
    });
});

// Create new patient
app.post('/api/patients', (req, res) => {
    const {
        pid, name, age, gender, contact,
        weight, height, bp, symptoms, history,
        fileData, fileName, createdAt
    } = req.body;

    const sql = `INSERT INTO patients (
        pid, name, age, gender, contact, 
        weight, height, bp, symptoms, history, 
        fileData, fileName, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        pid, name, age, gender, contact,
        weight, height, bp, symptoms, history,
        fileData, fileName, createdAt
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, pid });
    });
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM patients WHERE id = ?', id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// Update patient
app.put('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const {
        name, age, gender, contact,
        weight, height, bp, symptoms, history
    } = req.body;

    const sql = `UPDATE patients SET 
        name = ?, age = ?, gender = ?, contact = ?, 
        weight = ?, height = ?, bp = ?, symptoms = ?, history = ? 
        WHERE id = ?`;

    const params = [
        name, age, gender, contact,
        weight, height, bp, symptoms, history, id
    ];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Updated', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
