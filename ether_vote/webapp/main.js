var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var bodyParser = require('body-parser');

var fs = require('fs');

var Web3 = require('web3');
var solc = require('solc');

var app = express();

var http = require('http').Server(app);
var io = require("socket.io").listen(http);

var router =  express.Router();

function compile(str, path){
	return stylus(str)
		.set('filename', path)
		.use(nib())
};

app.set('views', __dirname + '');
app.set('view engine', 'pug'); // i dont have to load pug myself if i do this.
app.use(stylus.middleware(
	{
		src: __dirname + '/public',
		compile: compile
	}
	));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '50mb'}));

// connect to the blockchain node
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:3000"));

app.use('/',router);

app.use('*',function(req,res){
  res.render('404');
});

http.listen(5000);
console.log('App listening at 5000');

var vote_contract_address = "0xd47bd08f5a57040ce71a838dd960fb9510b06fc5";
var vote_contract_abi = [{"constant":false,"inputs":[{"name":"project","type":"string"},{"name":"vote","type":"bool"}],"name":"vote","outputs":[],"payable":false,"type":"function"},{"payable":false,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"project","type":"string"},{"indexed":false,"name":"vote","type":"bool"},{"indexed":false,"name":"voter_address","type":"address"}],"name":"LogVote","type":"event"}];

var vote_contract_instance = web3.eth.contract(vote_contract_abi).at(vote_contract_address);

var filter = vote_contract_instance.LogVote().watch(function(err, res){
	if (err){
		console.log("There was an error.");
		console.log(err);
	}else{
		console.log("Someone voted!");
		console.log(res.args);
		io.emit("new_vote", res.args);
	};
});

router.get('/', function(req, res){
	console.log("Coinbase address: " + web3.eth.coinbase);

	res.render('index', {h1: 'Blockchain Vote', accounts: web3.personal.listAccounts});
});

router.post('/vote', function(req, res){
	var account_password = req.body.account_password;
	var project = req.body.project;
	var vote = req.body.vote=='true';

	web3.personal.unlockAccount(web3.eth.coinbase, account_password, 1000);

	console.log("Registering vote: " + vote);
	vote_contract_instance.vote(project, vote, {from: web3.eth.coinbase});

	res.send(JSON.stringify({'status': 'success'}));

});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit("some event", {for: "everyone"});
});

io.on("register_vote", function(vote_data){
	console.log(vote_data);
});