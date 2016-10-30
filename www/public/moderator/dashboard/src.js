$(document).ready(function(){

    var dashboardData = {};
    var markers = [];
    var map = '';
	// modal detail 
	var modal = new Modal({
        title : "Prompt",
        backdrop : true,
        handler : {
            OK : {class : "btn-success"},
            Cancel : {class : "btn-default", dismiss : true}
        }
    });

	// bar chart, flot library
	var barOptions = {
        series: {
            bars: {
                show: true,
                barWidth: 0.6,
                fill: true,
                fillColor: {
                    colors: [{
                        opacity: 0.8
                    }, {
                        opacity: 0.8
                    }]
                }
            }
        },
		xaxis: {
		    axisLabel: "Bulan",
		    axisLabelUseCanvas: true,
		    axisLabelFontSizePixels: 12,
		    axisLabelFontFamily: 'Verdana, Arial',
		    axisLabelPadding: 10,
		    ticks: [[0, "Jan"], [1, "Feb"], [2, "Mar"], [3, "Apr"],[4, "Mei"], [5, "Jun"], [6, "Jul"], [7, "Ags"], [8, "Sep"], [9, "Okt"], [10, "Nov"], [11, "Des"]]
		},
		yaxis: {
		    axisLabel: "Jumlah Laporan",
		    axisLabelUseCanvas: true,
		    axisLabelFontSizePixels: 12,
		    axisLabelFontFamily: 'Verdana, Arial',
		    axisLabelPadding: 3,
		    tickFormatter: function (v, axis) {
		        return v + "";
		    }
		},
        colors: ["#1ab394"],
        grid: {
            color: "#999999",
            hoverable: true,
            clickable: true,
            tickColor: "#D4D4D4",
            borderWidth:0
        },
        legend: {
            show: false
        },
        tooltip: true,
        tooltipOpts: {
            content: "%y laporan"
        }
    };
    var barData = {
        label: "bar",
        data: [[0, 11],[1, 15],[2, 25],[3, 24],[4, 13],[5, 18], [6, 27], [7, 42], [8, 35]]
            
    };
    $.plot($("#flot-bar-chart"), [barData], barOptions);


    // event tombol detail
    $('a[detailbtn]').off('click');
    $('a[detailbtn]').on('click', function(){
    	var title = $(this).children().last().children().last().html();
    	modal.setTitle('Detail ' + title);
    	modal.setBody('<div id="pie-detail"></div>').show();

    	// pie chart
    	setTimeout(function(){
    		c3.generate({
		        bindto: '#pie-detail',
		        data:{
		            columns: [
		                ['Umum', 30],
		                ['Kemacetan', 120],
		                ['Kesehatan', 68]
		            ],
		            colors:{
		                //data1: '#1ab394',
		                //data2: '#BABABA'
		            },
		            type : 'pie'
		        },
		        pie: {
				    label: {
				      	format: function(value, ratio, id) {
				        	return value;
				      }
				    }
			  	}
		    });
		    console.log("rendered");
    	}, 300);
    	// pie chart done
        modal.$buttons.OK.off("click");
        modal.$buttons.OK.on("click", function () {
            console.log("olalaaaa");
        });
    });


    var bandung = {lat: -6.909920, lng: 107.608136}; //TODO: do not hardcode. cari dari organizations._id
    map = new google.maps.Map($('#dashboard-maps')[0], {
        zoom: 12,
        center: bandung
    });


    // get all dashboard data
    $.ajax({
        method: 'GET',
        url: '/moderator/!/alldashboarddata',
        success: function(data, status, xhr){
            if(data.status===1){
                dashboardData = data.data;
                $('#totalcount').html(dashboardData.allreportltlng.length);
                $('#assignedcount').html(dashboardData.assignedreportltlng.length);
                $('#returnedcount').html(dashboardData.returnedreportltlng.length);
                $('#rejectedcount').html(dashboardData.rejectedreportltlng.length);

                reloadMarkers(dashboardData.allreportltlng);

                $('#dashboard-maps-filter').off('change');
                $('#dashboard-maps-filter').on('change', function(){
                    var selection = $(this).val();
                    switch (selection){
                        case 'Semua Laporan':
                            reloadMarkers(dashboardData.allreportltlng);
                            break;
                        case 'Pending':
                            reloadMarkers(dashboardData.unassignedreportltlng);
                            break;
                        case 'On Progress':
                            reloadMarkers(dashboardData.assignedreportltlng);
                            break;
                        case 'Selesai':
                            reloadMarkers([]); //TODO: belum dibuat query yg laporan selesai
                            break;
                    }
                    console.log("changed");
                });

            } else {
                var r = confirm("Gagal memuat data dashboard. Muat ulang halaman?");
                if (r == true) {
                    location.reload();   
                }
            }
            console.log(data);
            
        },
        error: function(xhr, status, err){

        }
    });

    function reloadMarkers(latLongArray){
        for (var x = 0; x < markers.length; x++) {
            markers[x].setMap(null);
        }
        markers = [];

        for(var i = 0; i<latLongArray.length; i++){
            var newLatLong = new google.maps.LatLng(latLongArray[i].lat, latLongArray[i].long);
            var newMarker = new google.maps.Marker({
                position: newLatLong,
                map: map,
                icon: '/img/pin.png',
                name: latLongArray[i].text.substring(0, 100)
            });
            
            google.maps.event.addListener(newMarker, 'click', function() {
                //$('#myModal').modal('show'); //TODO: buat modalnya yaaaaaaa
            });
            markers.push(newMarker);
        }
    }
});