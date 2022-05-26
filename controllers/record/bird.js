const handleGetBird = (req, res, db) => {
    const { user } = req.params;
    db.select('*').from('bird').orderBy('id').where('userid', '=', user)
    .then(data => {
        return res.status(200).json(data)
    })
    .catch(() => res.status(400).json('unable to complete request'))
}

const handlePostBird = (req, res, db) => {
    const { bird, store, dead, date, culled } = req.body;
    const { user } = req.params;
    if ((!bird && !store) && (dead || culled)) {
        db.select('*').from('bird').where('userid', '=', user)
        .then(data => {
            const oldStock = data[data.length-1].stock;
            const oldCulled = data[data.length-1].culled;
            const oldDead = data[data.length-1].dead_birds;
            db.insert({
                date: date,
                birds: 0,
                store: 'MORTALITY',
                dead_birds: (Number(dead) || 0) + (oldDead || 0),
                userid: user,
                culled: (Number(culled) || 0) + (oldCulled || 0),
                stock: (oldStock || 0) - (Number(dead) || 0)
            }).into('bird').then(() => res.status(200).json('success'))
            .catch(console.log)
        })
    }
    db.select('*').from('bird').where('userid', '=', user)
    .then(data => {
        const isDataValid = data.length;
        if(isDataValid > 0) {
            const oldStock = data[data.length-1].stock;
            const oldCulled = data[data.length-1].culled;
            const oldDead = data[data.length-1].dead_birds;
            db.insert({
                date: date,
                birds: bird,
                store: store,
                dead_birds: (Number(dead) || 0) + (oldDead),
                userid: user,
                culled: (Number(culled) || 0) + (oldCulled),
                stock: (oldStock - (Number(dead) || 0)) + Number(bird)
            }).into('bird').then(() => res.status(200).json('success'))
            .catch(console.log)
        } else {
            db.insert({
                date: date,
                birds: bird,
                store: store,
                dead_birds: dead,
                userid: user,
                culled: culled,
                stock: bird
            }).into('bird').then(() => res.status(200).json('success'))
            .catch(console.log)
        }
    }).catch(() => res.status(400).json('request failed'))
}

module.exports = {
    handleGetBird,
    handlePostBird
}