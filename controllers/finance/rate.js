const handleGetRate_f = (req, res, db) => {
    const { user } = req.params;
    db.select('big', 'small').from('rate').where('userid', '=', user)
    .then(data => {
        return res.json(data)
    })
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

const handlePostRate_f = (req, res, db) => {
    const { user } = req.params;
    const { big, small } = req.body;
    db('rate').update({
        big: big,  
        small: small, 
    }).where('userid', '=', user).then(data => res.status(200).json(data))
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

module.exports = {
    handleGetRate_f,
    handlePostRate_f
}