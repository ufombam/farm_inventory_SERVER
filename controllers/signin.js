const handleSignin = (req, res, db, bcrypt) => {
    const { email, pwd } = req.body;
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        if (!data.length) {
        res.status(400).end('You need to register an account')
    } else {
        const isValid = bcrypt.compareSync(pwd, data[0].hash);
        if (isValid) {
            return db.select('*').from('users').where('email', '=', req.body.email)
            .then(data => res.status(200).json(data[0]))
        }else {
            res.status(400).end('Wrong Credentials')
        }
    }
    }).catch((err) => {
        console.log(er)
        return res.json(400).json('unable to Sign in')
    })
}

module.exports = {
    handleSignin
}