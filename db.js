const mongoose = require('mongoose'),
URLSlugs = require('mongoose-url-slugs'),
passportLocalMongoose = require('passport-local-mongoose');


const Card = new mongoose.Schema({
	_id: {type: Number, required: true},
	name: {type: String, required: true},
	qty: {type: Number, required: true},
	img: {type: String, required: true},
	trade: {type: Boolean},
	uuid: {type: String}
});

const User = new mongoose.Schema({
  // username, password
  username: {type: String},
  pigeons: [{ type: Card}],
  pigeonsLength: {type: Number},
  notifications: [{type: String}]
});

const Item = new mongoose.Schema({
	name: {type: String, required: true},
	quantity: {type: Number, min: 1, required: true},
	checked: {type: Boolean, default: false, required: true}
}, {
	_id: true
});


const List = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  cards: {type: String, required: true},
	createdAt: {type: Date, required: true},
	items: [Item]
});


User.plugin(passportLocalMongoose);
List.plugin(URLSlugs('name'));

module.exports = mongoose.model('User', User);
mongoose.model('User', User);
mongoose.model('List', List);
mongoose.model('Item', Item);
mongoose.model('Card', Card);
mongoose.connect('mongodb+srv://belaburrito:lapizlapiz99@cluster0.24zyw.mongodb.net/pigeonData?retryWrites=true&w=majority');
