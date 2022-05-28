const handleGetCompost_f = (req, res, db) => {
    const { user } = req.params;
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    db('compost').sum('profit')
    .where({
        month: month, 
        year: year,
        userid: user 
    })
    .then(data => {
        return res.json(data)
    })
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

module.exports = {
    handleGetCompost_f
}