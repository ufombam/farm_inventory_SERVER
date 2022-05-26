const handleGetMsc = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('miscellaneous').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .catch(() => res.status(400).json('unable to complete request'))
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
    .catch(() => res.status(400).json('unable to submit'))
}

module.exports = {
    handleGetMsc,
    handlePostMsc
}