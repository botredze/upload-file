const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const database = require('../database');

const authenticateToken = require('../middlewares/authenticateToken');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads'; // Директория для сохранения загруженных файлов
        fs.mkdirSync(uploadPath, { recursive: true }); // Создаем директорию, если она не существует
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, filename);
    },
});

const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { originalname, filename, mimetype, size } = req.file;
        const uploadDate = new Date();

        const sql = 'INSERT INTO files (name, filename, mimetype, size, upload_date) VALUES (?, ?, ?, ?, ?)';
        const values = [originalname, filename, mimetype, size, uploadDate];
        database.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error saving file details to database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.sendStatus(200);
        });
    } catch (err) {
        console.error('Error during file upload:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/list', authenticateToken, async (req, res) => {
    try {
        const listSize = req.query.list_size || 10;
        const page = req.query.page || 1;
        const offset = (page - 1) * listSize;

        const sql = 'SELECT * FROM files LIMIT ? OFFSET ?';
        const values = [listSize, offset];
        database.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error retrieving file list from database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ files: result });
        });
    } catch (err) {
        console.error('Error during file listing:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;

        const sql = 'SELECT * FROM files WHERE id = ?';
        database.query(sql, fileId, (err, result) => {
            if (err) {
                console.error('Error retrieving file information from database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'File not found' });
            }

            const file = result[0];

            const filePath = path.join('./uploads', file.filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const deleteSql = 'DELETE FROM files WHERE id = ?';
                database.query(deleteSql, fileId, (err, result) => {
                    if (err) {
                        console.error('Error deleting file from database:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.sendStatus(200);
                });
            });
        });
    } catch (err) {
        console.error('Error during file deletion:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;

        const sql = 'SELECT * FROM files WHERE id = ?';
        database.query(sql, fileId, (err, result) => {
            if (err) {
                console.error('Error retrieving file information from database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'File not found' });
            }

            const file = result[0];
            res.json({ file });
        });
    } catch (err) {
        console.error('Error during file retrieval:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/download/:id', authenticateToken, async (req, res) => {
    try {
        const fileId = req.params.id;

        const sql = 'SELECT * FROM files WHERE id = ?';
        database.query(sql, fileId, (err, result) => {
            if (err) {
                console.error('Error retrieving file information from database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'File not found' });
            }

            const file = result[0];
            const filePath = path.join('./uploads', file.filename);

            res.download(filePath, file.filename);
        });
    } catch (err) {
        console.error('Error during file download:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/update/:id', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const fileId = req.params.id;

        const getSql = 'SELECT * FROM files WHERE id = ?';
        database.query(getSql, fileId, (err, result) => {
            if (err) {
                console.error('Error retrieving file information from database:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'File not found' });
            }

            const file = result[0];

            const filePath = path.join('./uploads', file.filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting old file:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                const { originalname, filename, mimetype, size } = req.file;
                const uploadDate = new Date();

                const updateSql = 'UPDATE files SET name = ?, filename = ?, mimetype = ?, size = ?, upload_date = ? WHERE id = ?';
                const values = [originalname, filename, mimetype, size, uploadDate, fileId];
                database.query(updateSql, values, (err, result) => {
                    if (err) {
                        console.error('Error updating file details in database:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.sendStatus(200);
                });
            });
        });
    } catch (err) {
        console.error('Error during file update:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
