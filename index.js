const express = require('express');
const app = express();
const PORT = 5000; 


app.get('/', (req, res) => {
    res.send('Hello World from Dokaan backend!');
});


app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
