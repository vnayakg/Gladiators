const express = require('express')
const multer = require('multer')
const cors = require('cors')
const vision = require('@google-cloud/vision');

const app = express();

//middeleware
app.use(cors())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
var upload = multer({ storage: storage }).single('file')


//getting code from image using google Vision
app.post('/upload', (req, res) => {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        }
        else if (err) {
            return res.status(500).json(err)
        }

        const client = new vision.ImageAnnotatorClient({
            keyFilename: "./quickcode-318508-f48be9cc14dc.json",
        })

        client.documentTextDetection(req.file.path)
            .then((results) => {
                const text = results[0].fullTextAnnotation.text

                return res.status(200).send({ file: req.file, text: text })

            })
            .catch(err => {
                console.log(err)
            })
    })
})

//---------------------------------------Login / register------------------------------------//

const getUsernames = async (user) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users WHERE email = ?', [user.email], (error, elements) => {
            if (error) {
                return reject(error);
            }
            return resolve(elements);
        });
    });
}

app.post('/register', async (req, res) => {
    const { name, username, password } = req.body

    console.log(name, username, password)

    const hash = bcrypt.hashSync(password, 10); // saltRounds = 10
    const user = { id: uuidv4(), name: name, email: username, password: hash, timestamp: new Date() }
    const isValid = schema.validate(user)
    
    if(isValid.error) return res.send(isValid.error.details[0].message)

    try {
        const query = await getUsernames(user)

        if (query.length === 0) {
            const postQuery = await connection.query('INSERT INTO users SET ?', user)
            return res.json({ registerStatus: true, id: user.id })
        }
        return res.send('user already exists')
    }
    catch (err) {
        console.log(err)
        return res.send('Error Occured')
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.send('username and password required')

    const user = { email: username, password: password }
    try {

        const query = await getUsernames(user)
        //console.log(query.length)
        if (query.length === 1) {
            const isValid = bcrypt.compareSync(user.password, query[0].password);

            if (isValid) {

                return res.json({ auth: true, id: query[0].id })
            }
            return res.send('Wrong credintials')
        }
        return res.send('user does not exist, please register')
    }
    catch (err) {
        console.log(err)
    }
})
//---------------------------------------------------------------------------------------------------------------//


//port
const PORT = process.env.PORT || 5000
// listening on port
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})