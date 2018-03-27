function getDropdown() {
    // Get the reference to the dropdown select element
    var selDataset = document.getElementById("selDataset");
    // Populate the select options
    Plotly.d3.json('/names', function(error, data){
        if (error) return console.warn(error);
        for (i = 0; i < data.length; i++) {
                    var selectedOption = document.createElement("option");
                    selectedOption.text = data[i];
                    selectedOption.value = data[i];
                    selDataset.appendChild(selectedOption);
                }
        getData(data[0], buildCharts)
    });
};


function getData(sampleid, callback) {
    Plotly.d3.json(`/samples/${sampleid}`, function(error, origData){
        if (error) return console.warn(error);
        Plotly.d3.json("/otu", function(error, otuData) {
            if (error) console.log(error);
        callback(origData,otuData);
    });
    Plotly.d3.json(`/metadata/${sampleid}`, function(error, metadata){
        if (error) return console.warn(error);
        getMetadata(metadata); 
        console.log(metadata);
    });  
});
};

function getMetadata(metadata) {
    var META = document.getElementById("sample_metadata");

    META.innerHTML = '';

    for (var key in metadata) {
        var ptag = document.createElement("p");
        ptag.innerHTML = `${key}: ${metadata[key]}`;
        META.appendChild(ptag);
    };
};

function buildCharts(origData,otuData) {
    
    //Pie data
    var top10IDs = [];
    var top10values = [];
    for (var i=0; i<10; i++) {
        top10IDs.push(origData.otu_ids.slice(0,10)[i]);
        top10values.push(origData.sample_values.slice(0,10)[i]);
        };

    //Bubble data
    var bubbleIDs = []
    var bubbleValues = []
    for (var i=0; i<10; i++) {
        bubbleIDs.push(origData.otu_ids[i]);
        bubbleValues.push(origData.sample_values[i]);
    };

    // Pie labels
    var pieLabels = [];
    for (var i=0; i<top10IDs.length; i++) {
        pieLabels.push(otuData[top10IDs[i]]);
    };
    console.log(pieLabels)

    // Bubble labels
    var bubbleLabels = [];
    for (var i=0; i<bubbleIDs.length; i++) {
        bubbleLabels.push(otuData[bubbleIDs[i]]);
    };
    console.log(bubbleLabels)

    // Plot pie chart
    var pieData = [{
        values: top10values,
        labels: top10IDs,
        type: "pie",
        hovertext: pieLabels
    }];   
    var pielayout = {
        height: 550,
        width: 550
        }
    var PIE = document.getElementById("piechart");
    Plotly.plot(PIE, pieData, pielayout);

    // Plot bubble chart
    var bubbleData = [{
        x: bubbleIDs,
        y: bubbleValues,
        mode: "markers",
        text: bubbleLabels,
        marker: {
            size: bubbleValues,
            color: bubbleIDs,
            colorscale: "Portland"}
    }]; 
    var BUBBLE = document.getElementById("bubblechart");
    Plotly.plot(BUBBLE, bubbleData);
};



function updateCharts(origData,otuData)  {
    //Pie data
    var top10IDs = [];
    var top10values = [];
    for (var i=0; i<10; i++) {
        top10IDs.push(origData.otu_ids.slice(0,10)[i]);
        top10values.push(origData.sample_values.slice(0,10)[i]);
        };

    // //Bubble data
    var bubbleIDs = []
    var bubbleValues = []
    for (var i=0; i<10; i++) {
        bubbleIDs.push(origData.otu_ids[i]);
        bubbleValues.push(origData.sample_values[i]);
    };

        // Pie labels
        var pieLabels = [];
        for (var i=0; i<10; i++) {
            pieLabels.push(otuData[top10IDs[i]]);
        };

        // Bubble labels
        var bubbleLabels = [];
        for (var i=0; i<10; i++) {
            bubbleLabels.push(otuData[bubbleIDs[i]]);
        };
    
    // Restyle pie plot  
    var PIE = document.getElementById("piechart");
    Plotly.restyle(PIE, "values", [top10values]);
    Plotly.restyle(PIE, "labels", [top10IDs]);
    Plotly.restyle(PIE, "hovertext", [pieLabels]);
    console.log(PIE)
    console.log(top10values)


    // Restyle bubble plot
    var BUBBLE = document.getElementById("bubblechart");
    Plotly.restyle(BUBBLE, "x", [bubbleIDs]);
    Plotly.restyle(BUBBLE, "y", [bubbleValues]);
    Plotly.restyle(BUBBLE, "text", [bubbleLabels]);
    Plotly.restyle(BUBBLE, "marker.size", [bubbleValues]);
    Plotly.restyle(BUBBLE, "marker.color", [bubbleIDs]);

};


function optionChanged(newsampleid) {
    getData(newsampleid, updateCharts);
};

function init() {
    getDropdown();
    getMetadata();
};

init();

