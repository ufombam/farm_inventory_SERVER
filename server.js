const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');



const db = knex({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'keleop',
    database : 'test'
    }
});
const app = express();
app.use(express.json());
app.use(cors());

//======================== ENDPOINT FOR SIGN-IN=======================
app.route('/signin')
    .post((req, res) => {
        const { email, pwd } = req.body;
        db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            if (!data.length) {
            res.status(400).end('You need to register an account')
        } else {
            const isValid = bcrypt.compareSync(pwd, data[0].hash);
            if (isValid) {
                return db.select('*').from('users').where('email', '=', req.body.email)
                .then(data => res.status(200).json(data[0]))
            }else {
                res.status(400).json('Wrong Credentials')
            }
        }
        }).catch(() => res.json(400).json('unable to Sign in'))
    })

//======================== ENDPOINT FOR USER REGISTRATION=======================

app.route('/register')
    .post((req, res) => {
        const { name, email, pwd } = req.body;
        const salt = 10;
        const hash = bcrypt.hashSync(pwd, salt);
        db.transaction(trx => {
            return trx.insert({
                hash: hash,
                email: email
            },['id']).into('login')
            .then(id => {
                return trx.insert({
                    userid: id[0].id,
                    big: 0,
                    small: 0
                }).into('rate')
            })
            .then(() => {
                return trx.insert({
                    name: name,
                    email: email,
                    joined: new Date()
                },['*']).into('users')
            })
            .then(user => res.status(200).json(user[0]))
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(() => res.status(400).json('Unable to Register'))
    })
//======================== ENDPOINTS FOR VIEW-RECORDS & NEW-RECORD=======================
app.route('/record/sales/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('id', 'date', 'big', 'small').from('sales').orderBy('id').where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
        const { big, small, date } = req.body;
        const { user } = req.params;
        db.insert({
            date: date,
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            big: big, 
            small: small, 
            userid: user
        }).into('sales')
        .then(() => res.status(200).json('submitted'))
        .catch(() => res.status(400).json('unable to submit'))
    });


app.route('/record/egg/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('*').from('egg_records').orderBy('id').where('userid', '=', user)  
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
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
        .then(res => res.status(200).json('success'))
        .catch(() => res.status(400).json('unable to submit'))
    });

app.route('/record/feed/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('*').from('feed').orderBy('id').where('userid', '=', user)
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
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
            }).catch(() => res.status(400).json('unable to update stock'))
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
                    .catch((err) => res.status(400).json('unable to complete request'))
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
                    .catch((err) => res.status(400).json('unable to complete request'))
                }
            }).catch(() => res.status(400).json('Unable to complete request'))
        }
    });


app.route('/record/bird/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('*').from('bird').orderBy('id').where('userid', '=', user)
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
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
    })

app.route('/record/names/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('name').from('customers').orderBy('name').where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })

app.route('/record/customers/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('*').from('customers').orderBy('id').where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
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
    })
    .put((req, res) => {
        const { name, qty, debt } = req.body;
        const { user } = req.params;
        db('customers')
        .where('name', '=', name, 'AND', 'userid', '=', user)
        .increment({
            purchases: qty,
            debt: debt,
        })
        .catch(() => res.status(400).json('unable to submit'))
    })
    .delete((req, res) => {
        const { name } = req.body;
        const { user } = req.params;
        db('customers')
        .where('name', '=', name, 'AND', 'userid', '=', user)
        .del()
        .catch(() => res.status(400).json('operation failed'))
    });

app.route('/record/compost/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('*').from('compost').orderBy('id').where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
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
        .catch(err => console.log(err))
    });

app.route('/record/msc/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('*').from('miscellaneous').orderBy('id').where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
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
    });

//======================== ENDPOINTS FOR FINANCE=======================

app.route('/finance/sales/:user')
    .get((req, res) => {
        const { user } = req.params;
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        db('sales').sum({big: 'small', small: 'big'})
        .where({
            month: month, 
            year: year,
            userid: user 
        })
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
        const { big, small, date } = req.body;
        const { user } = req.params;
        db.insert({
            date: date,
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            big: big, 
            small: small,
            userid: user
        }).into('sales')
        .catch(() => res.status(400).json('unable to submit'))
    });

    app.route('/finance/rate/:user')
    .get((req, res) => {
        const { user } = req.params;
        db.select('big', 'small').from('rate').where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })
    .post((req, res) => {
        const { user } = req.params;
        const { big, small } = req.body;
        db('rate').update({
            big: big,  
            small: small, 
        }).where('userid', '=', user)
        .catch(() => res.status(400).json('unable to submit'))
    });

app.route('/finance/compost/:user')
    .get((req, res) => {
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
        .catch(() => res.status(400).json('unable to complete request'))
    })

app.route('/finance/feed/:user')
    .get((req, res) => {
        const { user } = req.params;
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        db('feed').sum({sum: 'expense'})
        .where({
            month: month, 
            year: year,
            userid: user 
        })
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })

app.route('/finance/msc/:user')
    .get((req, res) => {
        const { user } = req.params;
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        db('miscellaneous').sum({sum: 'expense'})
        .where({
            month: month, 
            year: year,
            userid: user 
        })
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })

app.route('/finance/debt/:user')
    .get((req, res) => {
        const { user } = req.params;
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        db('customers').sum({sum: 'debt'}).where('userid', '=', user)
        .then(data => {
            return res.json(data)
        })
        .catch(() => res.status(400).json('unable to complete request'))
    })




const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`)
});








// record/eggs - GET
// record/feed - POST
// record/bird - POST
// record/customers - PUT
// record/customers/register -POST
// record/compost - POST
// record/msc - POST