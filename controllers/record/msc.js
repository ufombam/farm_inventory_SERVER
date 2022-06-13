const handleGetMsc = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('miscellaneous').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.status(200).json(data)
    })
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}
const handlePostMsc = (req, res, db) => {
    const { expense, purpose, date, description } = req.body;
    const { user } = req.params;
    db.insert({
        date: date,
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        purpose: purpose,
        expense: expense,
        description: description, 
        userid: user
    }).into('miscellaneous')
    .then(() => res.status(200).json('success'))
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

module.exports = {
    handleGetMsc,
    handlePostMsc
}