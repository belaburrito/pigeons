
require('./db');
require('./auth');


const passport = require('passport');
const express = require('express');
const path = require('path');

const uri = process.env.MONGODB_URI;

const routes = require('./routes/index');
const list = require('./routes/list');
const listItem = require('./routes/list-item');

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

// make user data available to all templates
app.use((req, res, next) => {
  next();
});

app.use('/', routes);
app.use('/list', list);
app.use('/list-item', listItem);

//Mongoose
const mongoose = require('mongoose');
const Card = mongoose.model('Card');

/*app.get('/', (req, res) => {
  console.log(req.session.test);
  res.render();
});*/


//routers
/*
app.post('/', (req, res) => {
  res.redirect('/login');
  //console.log(req.body);
  /*const {name, qty, img, id} = req.body;*/
  /*const newCard = new Card({
    _id: 01,
    name: req.body.name,
    qty: parseInt(req.body.qty),
    img: req.body.img,
    id: parseInt(req.body.id)
  });

  newCard.save((err, card) => {
    if(err){
      console.log(err);
      return;
    }
    req.session.card = card;
    //console.log(req.session.card);
    res.redirect('/');
  });
   
});
*/
/*
app.get('/mine', (req, res) => {
  if(tempCards.length>1){
    res.render('mine', {'card': tempCards});
  }
  else{
    tempCards.push(req.session.card);
    res.render('mine', {'card': tempCards});
  }
});
*/


app.listen(process.env.PORT || 5000);
