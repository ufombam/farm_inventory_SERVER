const handleGetCompost = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('compost').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

const handlePostCompost = (req, res, db) => {
    const { compost, profit, date } = req.body;
    const { user } = req.params;
    db.insert({
        date: date,
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        qty: compost,
        profit: profit,
        userid: user
    }).into('compost')
    .then(() => res.status(200).json('Submitted'))
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

module.exports = {
    handleGetCompost,
    handlePostCompost
}