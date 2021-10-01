const connection = require("./DatabaseConnection");
const postNote = async (note) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO notes SET ?', note, (error, elements) => {
            if (error) {
                return reject(error);
            }
            return resolve(elements);
        });
    });
}

app.post('/note', async (req, res) => {
    const { id, text, noteId } = req.body

    try {
        const result = await postNote({ id: id, text: text, noteId: noteId, timestamp: new Date() })

        res.send('note inserted successfully')
    }
    catch (err) {
        console.log(err)
        res.send("Error occured")
    }
})

const getNotes = async (id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM notes WHERE id = ?', id, (error, elements) => {
            if (error) {
                return reject(error);
            }
            return resolve(elements);
        });
    });
}

app.get('/notes/:id', async (req, res) => {
    const id = req.params.id
    console.log(id)
    try {
        const notes = await getNotes(id);
        console.log(notes)
        res.send(notes)
    }
    catch (err) {

        res.send('error occured')

    }
})
const deleteNote = async (noteId) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM notes WHERE noteId = ?', noteId, (error, elements) => {
            if (error) {
                return reject(error);
            }
            return resolve(elements);
        });
    });
}


app.delete('/note/:id', async (req, res) => {
    const noteId = req.params.id
    console.log(noteId)
    try {
        const result = await deleteNote(noteId)
        //console.log(result)
        res.send('successfully deleted')
    }
    catch (err) {
        res.send('error occured')
    }

})