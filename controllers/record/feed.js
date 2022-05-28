const handleGetFeed = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('feed').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.status(200).json(data)
    })
    .catch((err) => {
        console.log(err)
        return res.status(400).json('unable to complete request')
    })
}

const handlePostFeed = (req, res, db) => {
    const { qty, store, expense, date, used } = req.body;
    const { user } = req.params;
    if (!qty && !store && !expense) {
        db.select('*').from('feed').where('userid','=', user)
        .then(data => {
            const id = data[data.length-1].id;
            db('feed')
            .where('id', '=', id, 'AND', 'userid', '=', user)
            .decrement({
                stock: used,
            })
            .then(() => res.status(200).json('success'))
        }).catch((err) => {
            console.log(err)
            return res.status(400).json('unable to complete request')
        })
    } else {
        db.select('*').from('feed').where('userid','=', user)
        .then(data => {
            if (data[data.length-1].stock !== 0) {
                db.insert({
                    date: date,
                    year: new Date().getFullYear(),
                    month: new Date().getMonth(),
                    qty: qty, 
                    store: store, 
                    expense: expense,
                    userid: user,
                    stock: (Number(qty) + data[data.length-1].stock) - Number(used)
                }).into('feed')
                .then(() => res.status(200).json('success'))
                .catch((err) => {
                    console.log(err)
                    return res.status(400).json('unable to complete request')
                })
            } else {
                db.insert({
                    date: date,
                    year: new Date().getFullYear(),
                    month: new Date().getMonth(),
                    qty: qty, 
                    store: store, 
                    expense: expense,
                    userid: user,
                    stock: Number(qty) - Number(used)
                }).into('feed')
                .then(() => res.status(200).json('success'))
                .catch((err) => {
                    console.log(err)
                    return res.status(400).json('unable to complete request')
                })
            }
        }).catch((err) => {
            console.log(err)
            return res.status(400).json('unable to complete request')
        })
    }
}

module.exports = {
    handleGetFeed,
    handlePostFeed
}