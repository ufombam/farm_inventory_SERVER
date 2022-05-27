const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const signin = require('./controllers/signin');
const register = require('./controllers/register');
const sales = require('./controllers/record/sales');
const egg = require('./controllers/record/egg');
const { handleGetFeed, handlePostFeed } = require('./controllers/record/feed');
const { handleGetBird, handlePostBird } = require('./controllers/record/bird');
const { handleGetCustomers, handlePostCustomers, handlePutCustomers, handleDeleteCustomers } = require('./controllers/record/customers');
const { handlePostCompost, handleGetCompost } = require('./controllers/record/compost');
const { handleGetMsc, handlePostMsc } = require('./controllers/record/msc');
const { handleGetSales_f, handlePostSales_f } = require('./controllers/finance/sales');
const { handlePostRate_f, handleGetRate_f } = require('./controllers/finance/rate');
const { handleGetCompost_f } = require('./controllers/finance/compost');
const { handleGetFeed_f } = require('./controllers/finance/feed');
const { handleGetMsc_f } = require('./controllers/finance/msc');
const { handleGetDebt_f } = require('./controllers/finance/debt');




const db = knex({
    client: 'pg',
    connection: {
        connectionString : process.env.DATABASE_URL,
        ssl:  {
            rejectUnauthorized: false
        }
    }
});
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'https://majestic-conkies-cd1bd9.netlify.app',
    methods: ['GET','POST','DELETE','UPDATE','PUT']
}));


app.get('/', (req, res) => res.json('App is working'))

//======================== ENDPOINT FOR SIGN-IN=======================
app.route('/signin')
    .post((req, res) => {signin.handleSignin(req, res, db, bcrypt)})

//======================== ENDPOINT FOR USER REGISTRATION=======================

app.route('/register')
    .post((req, res) => {register.handleRegister(req, res, db, bcrypt)})
//======================== ENDPOINTS FOR VIEW-RECORDS & NEW-RECORD=======================
app.route('/record/sales/:user')
    .get((req, res) => {sales.handleGetSales(req, res, db)})
    .post((req, res) => {sales.handlePostSales(req, res, db)});


app.route('/record/egg/:user')
    .get((req, res) => {egg.handleGetEgg(req, res, db)})
    .post((req, res) => {egg.handlePostEgg(req, res, db)});

app.route('/record/feed/:user')
    .get((req, res) => {handleGetFeed(req, res, db)})
    .post((req, res) => {handlePostFeed(req, res, db)});


app.route('/record/bird/:user')
    .get((req, res) => {handleGetBird(req, res, db)})
    .post((req, res) => {handlePostBird(req, res, db)})

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
    .get((req, res) => {handleGetCustomers(req, res, db)})
    .post((req, res) => {handlePostCustomers(req, res, db)})
    .put((req, res) => {handlePutCustomers(req, res, db)})
    .delete((req, res) => {handleDeleteCustomers(req, res, db)});

app.route('/record/compost/:user')
    .get((req, res) => {handleGetCompost(req, res, db)})
    .post((req, res) => {handlePostCompost(req, res, db)});

app.route('/record/msc/:user')
    .get((req, res) => {handleGetMsc(req, res, db)})
    .post((req, res) => {handlePostMsc(req, res, db)});

//======================== ENDPOINTS FOR FINANCE=======================

app.route('/finance/sales/:user')
    .get((req, res) => {handleGetSales_f(req, res, db)})
    .post((req, res) => {handlePostSales_f(req, res, db)});

app.route('/finance/rate/:user')
    .get((req, res) => {handleGetRate_f(req, res, db)})
    .post((req, res) => {handlePostRate_f(req, res, db)});

app.route('/finance/compost/:user')
    .get((req, res) => {handleGetCompost_f(req, res, db)})

app.route('/finance/feed/:user')
    .get((req, res) => {handleGetFeed_f(req, res, db)})

app.route('/finance/msc/:user')
    .get((req, res) => {handleGetMsc_f(req, res, db)})

app.route('/finance/debt/:user')
    .get((req, res) => {handleGetDebt_f(req, res, db)})




const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`)
});