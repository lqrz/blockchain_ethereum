
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

function get_accounts(){
	var accounts = [];

	for (var i = 0; i < web3.personal.listAccounts.length; i++) {
		accounts.push({
						"address": web3.personal.listAccounts[i],
						"amount": web3.eth.getBalance(web3.personal.listAccounts[i]).toNumber()
						});

	}
	return accounts;
};

router.get('/', function(req, res){
	console.log("Coinbase address: " + web3.eth.coinbase);

	res.render('index', {h1: 'Blockchain contract deployer', accounts: get_accounts()});
});

router.get('/get_accounts', function(req, res){
	res.send(get_accounts());
});

router.post('/create_account', function(req, res){
	var new_account_address = web3.personal.newAccount(req.body.password);
	res.send(JSON.stringify({'status': 'success', 'new_account_address': new_account_address}));
});

router.post('/remove_account', function(req, res){
	// TODO: delete the keystore file
	res.send(JSON.stringify({'status': 'TODO'}));
});

router.post('/deploy', function(req, res){

	// get the source code
	// console.log(req.body.source_code);

	var contract_name = req.body.source_code.replace(/^contract\s(\w+)\s*{(.|\n|\r)+$/, '$1');
	var init_supply = req.body.source_code.replace(/(.|\n|\r)+coinBalanceOf\[msg.sender\]\s*=\s*(\d+);(.|\n|\r)+$/, '$2');

	// compile the source code
	var output = solc.compile(req.body.source_code, 1);
	var bytecode = output.contracts[contract_name].bytecode;
	var abi = JSON.parse(output.contracts[contract_name].interface);

	// get the contract object
	var contract_object = web3.eth.contract(abi);

	web3.personal.unlockAccount(web3.eth.coinbase, req.body.account_password, 1000);

	// console.log("Miner.start()")
	// web3.miner.start()

	// deploy contract
	console.log("Deploying the contract");
	global_contract_instance = contract_object.new(
			{
				data: '0x' + bytecode,
				from: req.body.account_from,
				gas: 90000*2	//TODO: how to dynamically set this?
			}, function(err, contract_deployed){
		       // NOTE: The callback will fire twice!
		       // Once the contract has the transactionHash property set and once its deployed on an address.
		       // Note that the returned "contract_deployed" === "contract_instance",

				if (err){
					console.log('ERROR: ' + err);
					return;
				};

				if(!contract_deployed.address) {
					console.log("Waiting for mining! Contract transaction hash: " + contract_deployed.transactionHash);
				}else{
					console.log("Contract Mined! Address: " + contract_deployed.address);
					// console.log("Miner.stop()");
					// web3.miner.stop()
					res.send(JSON.stringify(
								{
									'status': 'success',
									'contract_name': contract_name,
									'contract_address': contract_deployed.address,
									'contract_abi': contract_deployed.abi,
									'account_from': req.body.account_from
								}
							));
				};
			}
		);
});
