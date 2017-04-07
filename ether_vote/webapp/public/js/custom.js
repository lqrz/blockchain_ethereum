$(document).ready(function(){

	var votes = {
					"op1": [],
					"op2": []
				};

	// Notice that I’m not specifying any URL when I call io(), since it defaults to trying to connect to the host that serves the page.
	var socket = io();

	socket.on("new_vote", function(msg){
		console.log(msg);
		votes[msg.project].push(msg.vote);
		console.log(votes);
		plot();
	});

	function freq_count(votes){
		var cnt_true = 0;

		for (var i=0; i<votes.length; i++){
			cnt_true += votes[i];
		}

		return [cnt_true, votes.length-cnt_true];
	};

	function plot(){
		console.log("Plotting: " + $("#project option:selected").val());
		console.log(freq_count(votes[$("#project option:selected").val()]));
		var myChart = new Chart($("#myChart_"+$("#project option:selected").val()), {
		    type: 'bar',
		    data: {
		        labels: ["Great", "Terrible"],
		        datasets: [{
		            label: '# of Votes',
		            data: freq_count(votes[$("#project option:selected").val()]),
		            backgroundColor: [
		                'rgba(75, 192, 192, 0.2)',
		                'rgba(255, 99, 132, 0.2)'
		                // 'rgba(255, 206, 86, 0.2)',
		                // 'rgba(75, 192, 192, 0.2)',
		                // 'rgba(153, 102, 255, 0.2)',
		                // 'rgba(255, 159, 64, 0.2)'
		            ],
		            borderColor: [
		                'rgba(75, 192, 192, 1)',
		                'rgba(255,99,132,1)'
		                // 'rgba(255, 206, 86, 1)',
		                // 'rgba(75, 192, 192, 1)',
		                // 'rgba(153, 102, 255, 1)',
		                // 'rgba(255, 159, 64, 1)'
		            ],
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	responsive: false,
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        }
		    }
		});
	};

    $("button").prop('disabled', true);

    $("select").change(function(){
		console.log("The selector changed: " + $("#project option:selected").val());
    	$("button").prop('disabled', false);

    	if ($("select option:selected").val()=="op1"){
			$("#myChart_op1").css("display","block");
			$("#myChart_op2").css("display","none");
			plot();
		};

    	if ($("select option:selected").val()=="op2"){
			$("#myChart_op2").css("display","block");
			$("#myChart_op1").css("display","none");
			plot();
		};
    		
    	if ($("select option:selected").val()!="op1" && $("select option:selected").val()!="op2" ){
			$("#myChart_op1").css("display","none");
			$("#myChart_op2").css("display","none");
		};
	});

	$("button").click(function(){

		console.log($(this).attr("id"));

		$('#project').prop('disabled', true);
    	$("button").prop('disabled', true);

		var data = 	{
					'account_password': $("#account_password").val(),
					'project': $("#project option:selected").val(),
					'vote': $(this).attr("id")
				};

		json_obj = JSON.stringify(data);

		// socket.emit("register_vote", data);

		$.ajax({
			type: 'POST',
			url: '/vote',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false,
		})
		.success(function(server_response){
			console.log(server_response);
			$('#project').prop('disabled', false);
	    	$("button").prop('disabled', false);
		});

	});

});