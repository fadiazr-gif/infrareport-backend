const express = require('express');

const app = express();
const port = Number(process.env.FRONTEND_PORT || 5173);

app.get('/config.js', (_req, res) => {
    const apiUrl = process.env.API_URL || 'http://localhost:3000/api/activos';
    res.type('application/javascript').send(`window.INFRAREPORT_API = ${JSON.stringify(apiUrl)};`);
});

app.use(express.static(__dirname + '/public'));
app.listen(port, () => console.log(`Frontend: http://localhost:${port}`));
