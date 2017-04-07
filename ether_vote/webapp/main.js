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

const vote_contract_abi = require('./contract/ethervote_abi.json').abi;

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

if (process.env.ETHERVOTE_ADDRESS==undefined){
	throw new Error("Missing ETHERVOTE_ADDRESS environment variable.");
};

var vote_contract_address = process.env.ETHERVOTE_ADDRESS;

var vote_contract_instance = web3.eth.contract(vote_contract_abi).at(vote_contract_address);

// https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-events
const vote_attempt = vote_contract_instance.LogVote({}, {fromBlock: 0, toBlock: 'latest'});
vote_attempt.watch((err, res) => {
	console.log("Entering the watch");

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
	console.log("Contract address: " + process.env.ETHERVOTE_ADDRESS);

	res.render('index', {h1: 'Blockchain Vote', accounts: web3.personal.listAccounts});
});

router.post('/vote', function(req, res){
	var account_password = req.body.account_password;
	var project = req.body.project;
	var vote = req.body.vote=='true';

	web3.personal.unlockAccount(web3.eth.coinbase, account_password, 1000);

	console.log("Registering vote: " + vote + " to project: " + project);
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