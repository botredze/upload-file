const express = require('express');
const database = require('./config/database');
const cors = require('cors');

const PORT = process.env.PORT || 3000

const app = express();
app.use(express.json());
app.use(database);

app.use(cors())

const authRoutes = require('./routs/auth.routes');
const fileRoutes = require('./routs/file.routes');

app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
