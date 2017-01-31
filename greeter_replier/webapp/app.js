
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

// var balanceWei = web3.eth.getBalance(account).toNumber();
// var balance = web3.fromWei(balanceWei, 'ether');

// var number = web3.eth.blockNumber;

// console.log(web3);
// console.log(number)

app.use('/',router);

app.use('*',function(req,res){
  res.render('404');
});

app.listen(5000);
console.log('App listening at 5000');

router.get('/', function(req, res){
	console.log("Coinbase address: " + web3.eth.coinbase);

	res.render('index', {h1: 'Blockchain contract interact', accounts: web3.personal.listAccounts});
});

router.post('/greet', function(req, res){
	
	var password = req.body.account_password;

	var contract_address = "0xc9da8dbbbc3d71dee0b0781bb6b68a30b89f2b03"
	var contract_abi = [{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"greet","outputs":[{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"_greeting1","type":"bytes32"},{"name":"_greeting2","type":"bytes32"}],"payable":false,"type":"constructor"}]
	
	web3.personal.unlockAccount(web3.eth.coinbase, req.body.account_password, 1000);

	// hello
	var contract_instance = web3.eth.contract(contract_abi).at(contract_address);

	console.log(contract_instance.greet());

	res.send(JSON.stringify({'status': 'success', 'response': contract_instance.greet()}));

});
