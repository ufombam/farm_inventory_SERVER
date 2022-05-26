const handleGetCustomers = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('customers').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .catch(() => res.status(400).json('unable to complete request'))
}

const handlePostCustomers = (req, res, db) => {
    const { name, date } = req.body;
    const { user } = req.params;
    db.insert({
        registration: date,
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        name: name,
        userid: user
    }).into('customers')
    .then(() => res.status(200).json('Customer data created'))
    .catch(() => res.status(400).json('Unable to submit'))
}

const handlePutCustomers = (req, res, db) => {
    const { name, qty, debt } = req.body;
    const { user } = req.params;
    db('customers')
    .where('name', '=', name, 'AND', 'userid', '=', user)
    .increment({
        purchases: qty,
        debt: debt,
    })
    .catch(() => res.status(400).json('unable to submit'))
}

const handleDeleteCustomers = (req, res, db) => {
    const { name } = req.body;
    const { user } = req.params;
    db('customers')
    .where('name', '=', name, 'AND', 'userid', '=', user)
    .del()
    .catch(() => res.status(400).json('operation failed'))
}

module.exports = {
    handleGetCustomers,
    handlePostCustomers,
    handlePutCustomers,
    handleDeleteCustomers,
}