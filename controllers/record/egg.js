const handleGetEgg = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('egg_records').orderBy('id').where('userid', '=', user)  
    .then(data => {
        return res.json(data)
    })
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

const handlePostEgg = (req, res, db) => {
    const { damaged_eggs, date, sizes } = req.body;
    const { user } = req.params;
    db.insert({
        big: sizes.big.quantity, 
        bunit: sizes.big.unit, 
        small: sizes.small.quantity, 
        sunit: sizes.small.unit, 
        damaged_ggs: damaged_eggs, 
        date: date,
        userid: user
    }).into('egg_records')
    .then(data => res.status(200).json('success'))
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

module.exports = {
    handleGetEgg,
    handlePostEgg
}