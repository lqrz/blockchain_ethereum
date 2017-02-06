$(document).ready(function(){

	var accounts = null;
	var contracts = null;

	function get_accounts(){
		var accounts = [];
		var tds = $("table tbody tr td:first-child");

		for(var i=0; i<tds.length;i++){
			accounts.push($(tds[i]).text());
		}

		return accounts;

	};

	function populate_selector(accounts){
		$.each(accounts, function(key,value){
			$("#account_selector").append($("<option>", {value: key}).text(value));
		});
	};

	accounts = get_accounts();
	populate_selector(accounts);

	$(".panel").css("display","none");

	$("nav ul li a").click(function(){
		// console.log($(this).attr("id"));
		$(".panel").css("display","none");
		$("#"+$(this).attr("id")+"_panel").css("display", "block");
	});

	$("#nav_create_account").click(function(){
		$.ajax({
			type: 'GET',
			url: '/get_accounts',
		})
		.success(function(server_response){
			console.log(server_response);
			// TODO: update ether
		});
	});

	$(".remove_account").click(function(){
		console.log("Removing account");
		var account_address = $(this).attr("data-acc-add");

		var row = $(this).parent("td").parent("tr");

		json_obj = JSON.stringify(
				{
					'account_address': account_address
				}
			);

		$.ajax({
			type: 'POST',
			url: '/remove_account',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false,
		})
		.success(function(server_response){
			console.log(server_response);
			row.remove();
		});

	});

	$("#create_account").click(function(){

		console.log("Creating new account");

		json_obj = JSON.stringify(
				{
					'password': $("#new_account_password").val()
				}
			);

		$.ajax({
			type: 'POST',
			url: '/create_account',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false,
		})
		.success(function(server_response){
			console.log(server_response);
			var new_account_address = jQuery.parseJSON(server_response).new_account_address;
			$('#table_accounts > tbody:last-child').append(
				"<tr>" +
					"<td>"+new_account_address+"</td>" +
					"<td>0</td>" +
				"</tr>"
				);
		});
	});

	$("#deploy_button").click(function(){

		json_obj = JSON.stringify(
			{
				'source_code': $("#source_code").val(),
				'account_from': $("#account_selector option:selected").text(),
				'account_password': $('#account_password').val()
			}
		);

		console.log("Sending contract data");
		console.log(json_obj);

		$.ajax({
			type: 'POST',
			url: '/deploy',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false,
			})
		.success(function(server_response){

			console.log(server_response);

			var contract_name = jQuery.parseJSON(server_response).contract_name;
			var contract_address = jQuery.parseJSON(server_response).contract_address;
			var contract_abi = jQuery.parseJSON(server_response).contract_abi;
			var account_address_from = jQuery.parseJSON(server_response).account_from;

			$("#table_contracts").find("tbody").append(
														"<tr>" +
														"<td>" + contract_name +
														"<td>" + JSON.stringify(contract_abi) +
														"<td>" + contract_address
														);
		});
	});

});