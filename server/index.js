const express = require('express')

const app = express();

//port
const PORT = process.env.PORT || 5000

// listening on port
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})