$(document).ready(function(){

	var global_contract_address = null;
	var global_contract_abi = null;

	$("#greet").click(function(){


		json_obj = JSON.stringify(
				{
					'account_password': $("#account_password").val()
				}
			);

		$.ajax({
			type: 'POST',
			url: '/greet',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false,
		})
		.success(function(server_response){
			console.log(server_response);
		});

	});

});