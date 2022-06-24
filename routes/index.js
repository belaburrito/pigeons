const express = require('express'), 
    router = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

//Mongoose
const Card = mongoose.model('Card');

function loggedIn(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.redirect('/login');
  }
}

router.get('/mine', loggedIn, function(req, res, next) {
  // req.user - will exist
  // load user orders and render them
  res.render('mine', {'message': 'test', 'user': req.user, 'card': req.user.pigeons});
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


router.get('/', (req, res) =>  {
  req.session.user = req.user;
  res.render('home', {'user': req.session.user});
  
});

router.get('/login', (req, res) =>  {
  res.render('login');
});

router.get('/register', (req, res) =>  {
  res.render('register');
});

router.get('/rankings', (req, res) => {
  User.find({}).sort({pigeonsLength: 'desc'}).exec((err, docs) => {
    if(err){
      console.log(err);
    }
    console.log(docs);    
    res.render('rankings', {sortedUser: docs, user: req.session.user});
  });
});

router.post('/register', (req, res) =>  {
  const {username, password} = req.body;
  User.register(new User({username}), req.body.password, (err, user) => {
    if (err) {
      res.render('register',{message:'Your registration information is not valid'});
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  });   
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if(user) {
      req.logIn(user, (err) => {
        res.redirect('/');
      });
    } else {
      res.render('login', {message:'Your login or password is incorrect.'});
    }
  })(req, res, next);
});

router.post('/', loggedIn, function(req, res, next) {
  // req.user - will exist
  // load user orders and render them
  //console.log('test' + req.user);
  //console.log('req body ' + req.body.name);
  Card.find({name: req.body.name}, function (err, card) {
    User.find({ username: req.user.username}, function (err, docs) {
      if(err){
        console.log(err);
      }
      docs[0].pigeons.addToSet(card[0]);
      docs[0].save();
    });


  });
  //update pigeonsLength to equal length of pigeons arr
  User.aggregate().match({username: req.user.username})
  .project({
    pigeonsLength: {$size:"$pigeons"}
  })
  .exec(function(err, cb){
    console.log(cb[0].pigeonsLength);
    User.findOneAndUpdate({username : req.user.username}, {pigeonsLength: cb[0].pigeonsLength}).exec();
  })
  res.render('saved');
});

// `:userId` is a route parameter. Express will capture whatever
// string comes after `/user/` in the URL and store it in
// `req.params.userId`
router.get('/card/:id', (req, res) => {
  console.log(req.params['id']);
  Card.find({uuid: req.params['id']}, function(err, card){
    if(err){
      console.log(err);
    }
    console.log(card);
    req.session.card = card;
    res.redirect('/found');
  });
});


router.get('/found', (req, res) => {
  console.log(req.session.card[0]);
  res.render('found', {card: req.session.card[0], user: req.session.user});
});


//TODO: redirect to the card you found once you log in/register

//TODO: implement trading
//create PUT UP FOR TRADE button in /mine
//form that asks you to enter the name of the user you'd like to trade with / back to my cards
//req.body.tradeToUser -> find matching user
//access cards of matching user with True on trading attribute
//send trading request to matching user
//User schema needs a notifications[] attribute to push trading requests into
//when matching user logs in, hbs will render their notifications if they exist
//trading request received has a reject/accept button
//upon clicking this button, handle card insertion/deletion with mongoose
function saveCard(id, cb) {
  Card.find({_id: id}, function(err, docs) {
    if (err) {
      cb(err, null);
    } else {
      console.log('found card');
      console.log(docs[0]);
      cb(null, docs[0]);
    }
  });
};

router.get('/trade', (req, res) =>  {
  res.render('trade', {cards: req.session.cardsForTrade, user: req.session.user});
});

router.post('/mine', (req, res) => {
  const id = parseInt(req.body._id);
  saveCard(id, function(err, card) {
    if (err) {
      console.log(err);
    }
    console.log('card in callback');
    console.log(card);
  });
  console.log(req.session.myCard);
  Card.findById(id, function (err, doc) {
    if (err) {
      console.log(err);
    }
    //saveInSession(doc);
    doc.trade = true;
    doc.save();
  });
  res.redirect('/trade');
});

router.post('/trade', (req, res) => {
  //console.log(req.body);
  req.session.trader = req.body.trader;
  User.find({username: req.session.trader}, function(err, docs){
    if(err){
      console.log(err);
      res.sendStatus(500);
      return;
    }
    //console.log(docs[0]);
    let cardsForTrade = [];
    for (let i = 0; i < docs[0].pigeonsLength; i++) {
      var currentCard = docs[0].pigeons[i];
      //console.log(currentCard);
      if(currentCard.trade===true){
        //console.log(true);
        cardsForTrade.push(currentCard);
      }
    req.session.cardsForTrade = cardsForTrade;
  }
  
  res.redirect('/trade');
  })
})

router.get('/success', (req, res) => {
  res.render('trade');
})

router.post('/success', (req, res) => {
  console.log(req.session.trader);
  console.log(req.body._id);
  console.log(req.body.myCard);
  //push notification to trader
  User.find({username: req.session.trader}, function(err, docs){
    if(err){
      console.log(err);
    }
    console.log(docs[0]);
  })
  res.render('trade', {message: 'Success!'});
})


module.exports = router;
