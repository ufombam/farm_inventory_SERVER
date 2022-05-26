const handleRegister = (req, res, db, bcrypt) => {
    const { name, email, pwd } = req.body;
    const salt = 10;
    const hash = bcrypt.hashSync(pwd, salt);
    db.transaction(trx => {
        return trx.insert({
            hash: hash,
            email: email
        },['id']).into('login')
        .then(id => {
            return trx.insert({
                userid: id[0].id,
                big: 0,
                small: 0
            }).into('rate')
        })
        .then(() => {
            return trx.insert({
                name: name,
                email: email,
                joined: new Date()
            },['*']).into('users')
        })
        .then(user => res.status(200).json(user[0]))
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(() => res.status(400).json('Unable to Register'))
}

module.exports = {
    handleRegister
}