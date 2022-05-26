const handleGetDebt_f = (req, res, db) => {
    const { user } = req.params;
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    db('customers').sum({sum: 'debt'}).where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .catch(() => res.status(400).json('unable to complete request'))
}

module.exports = {
    handleGetDebt_f
}