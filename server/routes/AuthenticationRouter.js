const connection = require("./DatabaseConnection");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");
const Joi = require('joi')

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

const schema = Joi.object({
    name: Joi.string()
        .required(),

    password: Joi.string()
        .min(6)
        .required(),

    email: Joi.string()
        .email()
        .required(),
    id: Joi.string(),
    timestamp: Joi.date()

})

app.post('/register', async (req, res) => {
    const { name, username, password } = req.body

    console.log(name, username, password)

    const hash = bcrypt.hashSync(password, 10); // saltRounds = 10
    const user = { id: uuidv4(), name: name, email: username, password: hash, timestamp: new Date() }
    const isValid = schema.validate(user)

    if (isValid.error) return res.send(isValid.error.details[0].message)

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