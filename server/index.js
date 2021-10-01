const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');

const app = express();

//middeleware
app.use(cors())

//port
const PORT = process.env.PORT || 5000

// init routers
const uploadRouter = require('./routes/UploadRouter');
const notesRouter = require('./routes/NotesRouter')
const authenticationRouter = require('./routes/AuthenticationRouter')


// bind router
app.use('/', uploadRouter);
app.use('/', notesRouter);
app.use('', authenticationRouter);

// listening on port
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})