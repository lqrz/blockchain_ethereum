
var express = require('express')
var stylus = require('stylus')
var nib = require('nib')
var bodyParser = require('body-parser')

var fs = require('fs');

var Web3 = require('web3');
var solc = require('solc');


var app = express()
var router =  express.Router()

function compile(str, path){
	return stylus(str)
		.set('filename', path)
		.use(nib())
}

app.set('views', __dirname + '')
app.set('view engine', 'pug') // i dont have to load pug myself if i do this.
app.use(stylus.middleware(
	{
		src: __dirname + '/public',
		compile: compile
	}
	))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json({limit: '50mb'}));

// connect to the blockchain node
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:3000"));

app.use('/',router);

app.use('*',function(req,res){
  res.render('404');
});

app.listen(5000);
console.log('App listening at 5000');

var contract_instance = null;


router.get('/', function(req, res){
	console.log("Coinbase address: " + web3.eth.coinbase);

	res.render('index', {h1: 'Blockchain greeter', accounts: web3.personal.listAccounts});
});

router.post('/greet', function(req, res){
	
	var password = req.body.account_password;
	var greeting_op = req.body.greeting_op;

	// var greeter_instance = Greeter.deployed()

	var greeter_address = "0x8e8833b868f821467af008e0e6c0dd8311fc9c12";
	var greeter_abi = [{"constant":false,"inputs":[],"name":"say_something","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_greeting","type":"bytes32"}],"name":"greet","outputs":[{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];

	web3.personal.unlockAccount(web3.eth.coinbase, password, 1000);

	// hello
	var greeter_instance = web3.eth.contract(greeter_abi).at(greeter_address);

	console.log(greeter_instance.say_something({from: web3.eth.coinbase}));

	console.log(greeter_instance.greet(greeting_op));

	res.send(JSON.stringify({'status': 'success', 'response': greeter_instance.greet(greeting_op, {from: web3.eth.coinbase})}));

});

