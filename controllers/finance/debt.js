const handleGetDebt_f = (req, res, db) => {
    const { user } = req.params;
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    db('customers').sum({sum: 'debt'}).where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .then(() => res.status(200))
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

module.exports = {
    handleGetDebt_f
}