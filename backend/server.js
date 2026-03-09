const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Conexión a Base de Datos (usando Pool basado en Promesas)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'reserva_espacios',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ===== RUTAS DE AUTENTICACIÓN =====
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            const user = rows[0];
            delete user.password; // no enviar password al frontend
            res.json(user);
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ===== RUTAS DE USUARIOS =====
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/users', async (req, res) => {
    const { username, password, email, role } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, password, email, role || 'student']
        );
        res.status(201).json({ id: result.insertId, message: 'Usuario creado' });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El usuario o email ya existe' });
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ===== RUTAS DE ENCARGADOS =====
app.get('/api/managers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM managers');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/managers', async (req, res) => {
    const { name, phone, aux_name, aux_phone, manager_photo, aux_photo } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO managers (name, phone, aux_name, aux_phone, manager_photo, aux_photo) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, aux_name, aux_phone, manager_photo, aux_photo]
        );
        res.status(201).json({ id: result.insertId, message: 'Encargado registrado' });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ===== RUTAS DE ESPACIOS =====
app.get('/api/spaces', async (req, res) => {
    try {
        const query = `
            SELECT s.*, m.name as manager_name, m.phone as manager_phone
            FROM spaces s
            LEFT JOIN managers m ON s.manager_id = m.id
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.get('/api/spaces/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM spaces WHERE id = ?', [req.params.id]);
        res.json(rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/spaces', async (req, res) => {
    const { name, manager_id, capacity, available_hours, resources, photo } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO spaces (name, manager_id, capacity, available_hours, resources, photo) VALUES (?, ?, ?, ?, ?, ?)',
            [name, manager_id, capacity, available_hours, resources, photo]
        );
        res.status(201).json({ id: result.insertId, message: 'Espacio creado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ===== RUTAS DE RESERVACIONES =====
app.get('/api/reservations', async (req, res) => {
    try {
        const query = `
            SELECT r.*, s.name as space_name, u.username as user_name
            FROM reservations r
            JOIN spaces s ON r.space_id = s.id
            JOIN users u ON r.user_id = u.id
            ORDER BY r.date DESC, r.start_time DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Reservaciones por espacio y fecha (para validar disponibilidad)
app.get('/api/reservations/check', async (req, res) => {
    const { space_id, date } = req.query;
    try {
        const [rows] = await pool.query(
            'SELECT start_time, end_time, status FROM reservations WHERE space_id = ? AND date = ? AND status != "rechazada"',
            [space_id, date]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/reservations', async (req, res) => {
    const { space_id, user_id, date, start_time, end_time } = req.body;
    
    // Validar regla de los 10 días
    const targetDate = new Date(date);
    const currentDate = new Date();
    const diffTime = Math.abs(targetDate - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 10) {
        return res.status(400).json({ error: 'Las reservaciones deben hacerse con al menos 10 días de anticipación' });
    }

    try {
        // Obtener el espacio para validar horario disponible
        const [spaceRows] = await pool.query('SELECT available_hours FROM spaces WHERE id = ?', [space_id]);
        if (spaceRows.length === 0) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }

        // available_hours tiene formato "HH:MM - HH:MM" o "HH:MM a HH:MM"
        const availableHoursStr = spaceRows[0].available_hours;
        const match = availableHoursStr.match(/(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i);
        if (match) {
            // Normalizar a "HH:MM:SS" para comparar correctamente
            const normalize = (t) => {
                const [h, m] = t.split(':');
                return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
            };
            
            const spaceOpen  = normalize(match[1]);
            const spaceClose = normalize(match[2]);
            const reqStart   = normalize(start_time);
            const reqEnd     = normalize(end_time);

            if (reqStart < spaceOpen || reqEnd > spaceClose || reqStart >= reqEnd) {
                return res.status(400).json({ 
                    error: `El horario solicitado está fuera del horario disponible del espacio (${match[1]} - ${match[2]}).`
                });
            }
        }

        // --- NUEVA VALIDACIÓN: Traslape de horarios ---
        // Verificamos si existe ya una reservación (pendiente o aprobada) que se traslape
        const overlapQuery = `
            SELECT * FROM reservations 
            WHERE space_id = ? 
            AND date = ? 
            AND status != 'rechazada'
            AND (
                (start_time < ? AND end_time > ?)
            )
        `;
        const [overlapRows] = await pool.query(overlapQuery, [space_id, date, end_time, start_time]);
        
        if (overlapRows.length > 0) {
            return res.status(400).json({ 
                error: 'Este horario ya se encuentra ocupado o solicitado por otra reservación.' 
            });
        }
        // ----------------------------------------------

        const [result] = await pool.query(
            'INSERT INTO reservations (space_id, user_id, date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, "pendiente")',
            [space_id, user_id, date, start_time, end_time]
        );
        res.status(201).json({ id: result.insertId, message: 'Reservación en proceso (Pendiente)' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al crear reservación' });
    }
});

app.put('/api/reservations/:id/status', async (req, res) => {
    const { status } = req.body; // 'aprobada' o 'rechazada'
    try {
        await pool.query('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Estado de reservación actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});
