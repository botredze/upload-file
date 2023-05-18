const express = require('express');
const fileRoutes = require('./routes/fileUpload.router');
const authRoutes = require('./routes/auth.routes');
const database = require('./database');
const cors = require('cors');

const PORT = process.env.PORT || 3000

const app = express();
app.use(express.json());

app.use(database);

app.use(cors())

app.use('/api/file', fileRoutes);

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});
