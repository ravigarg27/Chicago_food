d3.json('data.json', function makeGraphs(error, recordsJson) {
	
	//Clean data
	//Risk, Zip, Facility type, Latitude, Logitude, Neighborhood
	var records = recordsJson;
	
	records.forEach(function(d) {
		d["longitude"] = +d["longitude"];
		d["latitude"] = +d["latitude"];
		//d["zip"] = +d["zip"]
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions
	var riskDim = ndx.dimension(function(d) { return d["risk"]; });
	var facilityDim = ndx.dimension(function(d) { return d["facility_type"]; });
	var neighborhoodDim = ndx.dimension(function(d) { return d["neighborhood"]; });
	var zipDim = ndx.dimension(function(d) { return d["zip"]; });
	var allDim = ndx.dimension(function(d) {return d;});


	//Group Data
	var riskGroup = riskDim.group();
	var facilityGroup = facilityDim.group();
	var neighborhoodGroup = neighborhoodDim.group();
	var zipGroup = zipDim.group();
	var all = ndx.groupAll();


    //Charts
	var riskChart = dc.pieChart("#risk-pie-chart");
	var facilityChart = dc.rowChart("#facility-row-chart");
	var neighborhoodChart = dc.rowChart("#neighborhood-row-chart");
	//var zipMapChart = dc.geoChoroplethChart("#zip-map-chart");
	var neighborhoodMapChart = dc.geoChoroplethChart("#neighborhood-map-chart");

	riskChart
		.width(180)
		.height(180)
		.radius(80)
        .dimension(riskDim)
        .group(riskGroup)
        .label(function (d) {
            if (riskChart.hasFilter() && !riskChart.hasFilter(d.data.key)) {
                return d.data.key + '(0%)';
            }
            var label = d.data.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        })
        //.innerRadius(20)
        //.colors(['#3182bd', '#6baed6', '#9ecae1']);
         
	facilityChart
		.width(300)
		.height(310)
        .dimension(facilityDim)
        .group(facilityGroup)
        .colors(['#6baed6'])
        .elasticX(true)
        .ordering(function(d) { return -d.value })
        .labelOffsetY(10)
        .xAxis().ticks(4);

    neighborhoodChart
    	.width(300)
		.height(800)
        .dimension(neighborhoodDim)
        .group(neighborhoodGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

    d3.json("./static/geo/zipcodes.json", function (zipJson) {

    		console.log("Here");
    		var width  = 800;
  			var height = 800;
    		var center = d3.geo.centroid(zipJson)
      		console.log("Here");
      		var scale  = 150;
      		var offset = [width/2, height/2];
      		var projection = d3.geo.mercator().scale(scale).center(center)
          				.translate(offset);
          	console.log("Here");
      		// create the path
      		var path = d3.geo.path().projection(projection);
      		console.log("Here");
      		// using the path determine the bounds of the current map and use 
      		// these to determine better values for the scale and translation
      		var bounds  = path.bounds(zipJson);
      		console.log("Here");
      		var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
      		var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
      		var scale   = (hscale < vscale) ? hscale : vscale;
      		var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                        height - (bounds[0][1] + bounds[1][1])/2];
            console.log("Here");

            neighborhoodMapChart.width(width)
                    .height(height)
                    .dimension(zipDim)
                    .group(zipGroup)
                    .projection(d3.geo.mercator()
                    	.center(center)
                    	.scale(scale)
                    	.translate(offset)
                    	)
                    .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                    .colorDomain([0, 5000])
                    .colorCalculator(function (d) { return d ? neighborhoodMapChart.colors()(d) : '#ccc'; })
                    .overlayGeoJson(zipJson.features, "ZIP", function (d) {
                        return d.properties.ZIP;
                    })
                	.valueAccessor(function(kv) {
                    	return kv.value;
                	})
                    .title(function (d) {
                        return "Neighborhood: " + d.key //+ "\nTotal eating establishment: " + numberFormat(d.value ? d.value : 0) + "M";
                    });
    		dc.renderAll();
            });

	

});