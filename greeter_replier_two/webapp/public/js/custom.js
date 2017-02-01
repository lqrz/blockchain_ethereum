$(document).ready(function(){

	var global_contract_address = null;
	var global_contract_abi = null;

	$("#greet_one").change(function(){

		console.log("The selector changed");

		$("#reply").text("");
		$('#greet_one').prop('disabled', 'disabled');

		json_obj = JSON.stringify(
				{
					'account_password': $("#account_password").val(),
					'greeting_op': $( "#greet_one option:selected" ).val()
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
			answer = $.parseJSON(server_response).response[1];
			$("#reply").text(answer);
        	$('#greet_one').prop('disabled', false);
		});

	});

});