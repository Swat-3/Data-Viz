// JavaScript source code
var margin = { top: 10, right: 30, bottom: 40, left: 75 };

//Width and height
var outer_width = 850;
var outer_height = 400;
var svg_width = outer_width - margin.left - margin.right;
var svg_height = outer_height - margin.top - margin.bottom;
var barPadding = 3;

//Width and height
var axis_gap_bar = 15
var axis_gap_text = 3

// The year to display
var display_year = 2007, bubbleChart, tracingCountry = false, traceGroup;
// define a function that filters data by year
function yearFilter(value) {
    return (value.Year == display_year && value.GDP > 0 && value.Global_Competitiveness_Index > 0)
}
var playButton;
var moving = false;
createSlider();
var countries = ["", ""];

var columns = [];
var dataset_filteredC;
var svg = d3.select("#svg_compare"),
    marginCompare = { top: 20, right: 20, bottom: 70, left: 150 },
    width = +svg.attr("width") - marginCompare.left - marginCompare.right,
    height = +svg.attr("height") - marginCompare.top - marginCompare.bottom,
    mainPillarGroup = svg.append("g").attr("transform", "translate(" + marginCompare.left + "," + marginCompare.top + ")");

var y0 = d3.scaleBand()
    .rangeRound([0, height])
    .paddingInner(0.1);

var y1 = d3.scaleBand()
    .padding(0.05);

var x = d3.scaleLinear()
    .domain([0, 8])
    .rangeRound([0, width]);

var z = d3.scaleOrdinal()
    .range(["#78c679", "#fd8d3c"]);

//Get all the column names of pillars for display
function getPillars() {
    var columns1 = dataset.columns.slice(2, 14);
    for (i = 0; i < 12; i++) {
        var str = columns1[i];
        var pos = str.lastIndexOf("pillar_");
        var str1 = str.substring(pos + 7);
        str2 = str1.replace(/_/gi, " ");
        columns.push(str2);
    }
}

//Create axes for the country comparison graph
function createMultivariateSvg() {
    var xAxisPillars = mainPillarGroup.append("g")
        .attr("class", "axis1")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([0, 2, 4, 6, 8]));

    y0.domain(columns.map(function (d) { return d; }));
    var yAxisPillars = mainPillarGroup.append("g")
        .attr("class", "axis1")
        .call(d3.axisLeft(y0).ticks(null, "s"));
}


//Create SVG element for main bubble chart
var svg = d3.select("#bubblechart")
    .append("svg")
    .attr("width", svg_width + margin.left + margin.right)
    .attr("height", svg_height + margin.top + margin.bottom)
    .style("background", "aliceblue");

svg.append("text")
    .attr("id", "year_header")
    .attr("x", (svg_width + margin.left + margin.right) / 2)
    .attr("y", (svg_height + margin.top + margin.bottom) / 2)
    .attr("dx", "-1.40em")
    .attr("dy", ".35em")
    .style("font-size", "200px")
    .style("font-weight", "400")
    .style("letter-spacing", ".35em")
    .style("fill", "#cccccc")
    .text(display_year);

var svgChart = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dataset;
// Create an x-axis connected to the x scale
var xValue = function (d) { return +d.GDP; }, // data -> value
    xScale = d3.scaleLinear()
        .domain([0, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000])
        .range([0, 40, 120, 200, 280, 360, 440, 520, 600, 680, 760]),
    xMap = function (d) {
        return xScale(xValue(d));
    }, // data -> display
    xAxis = d3.axisBottom()
        .scale(xScale)
        .tickValues([0, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000])
        .tickFormat(d3.format(".0s"));

//Define Y axis
var yValue = function (d) { return +d.Global_Competitiveness_Index; }, // data -> value
    yScale = d3.scaleLinear()
        .range([svg_height, 0]), // value -> display
    yMap = function (d) { return yScale(yValue(d)); }, // data -> display
    yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

// setup fill color
var cValue = function (d) { return d.Region; },
    bubblecolor = d3.scaleOrdinal()
        .range(['#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#f781bf', '#a65628'])
    ;

var cSize = function (d) {
    var radius = Math.sqrt(d.Population / (3 * 314000));
    return radius;
}
var cPopulation = function (d) {
    return d.Population;
}

// Call the x-axis
svgChart.append("g")
    .attr("class", "axis")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + svg_height + ")")
    .call(xAxis);

// Call the y axis
svgChart.append("g")
    .attr("id", "y-axis")
    .call(yAxis);

//Create x axis label
svgChart.append("text")
    .attr("transform",
        "translate(" + (svg_width / 2) + " ," +
        (svg_height + margin.top + 30) + ")")
    .style("text-anchor", "middle")
    .text("GDP");
//Create y axis label
svgChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 25)
    .attr("x", 0 - (svg_height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Global competitiveness index");

var formatComma = d3.format(",");
function textSize(text) {
    if (!d3) return;
    var container = d3.select('body').append('svg');
    container.append('text')
        .attr("x", -99999)
        .attr("y", -99999)
        .text(text);
    var size = container.node().getBBox();
    container.remove();
    return { width: size.width, height: size.height };
}
// Define a function to draw bubbles
function generateVis3() {
    // Filter the data to only include the current year
    d3.select("#year_header").text(display_year)
        .style("font-size", "200px");
    var filtered_datset = dataset.filter(yearFilter);
    filtered_datset.sort(function (a, b) { return d3.descending(+a.Population, +b.Population) });

    if (bubbleChart == null) {
        bubbleChart = svgChart.append("g");
    }
    //// Join new data with old elements, if any.
    var circles = bubbleChart.selectAll(".dot")
        .data(filtered_datset, function key(d) {
            return d.Country;
        });

    ///******** HANDLE UPDATE SELECTION ************/
    circles
        .transition()
        .duration(700)
        .attr("r", cSize)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return bubblecolor(cValue(d)); });

    ///******** HANDLE ENTER SELECTION ************/
    circles.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("id", function key(d) { return d.Country; })
        .attr("r", cSize)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .attr("stroke", "#ccced1")
        .attr("stroke-width", 0.3)
        .style("fill", function (d) { return bubblecolor(cValue(d)); })
        .on("click", traceCountry)
        .on("mouseover", showTooltip)
        .on("mouseout", function (d) {
            if (svgChart._tooltipGroup) {
                svgChart._tooltipGroup.remove();
            }
            if (!tracingCountry) {
                fadeCircles(d, this.id, false);
            }
        });
    circles.exit()
        .remove().transition()
        .duration(700);
}
var resetTraceButton = d3.select("#reset-button");
resetTraceButton.on("click", removeTraceCountry);

function traceCountry(d) {
    removeTraceCountry();
    if (moving) {
        moving = false;
        clearInterval(timer);
        // timer = 0;
        playButton.text("Play");
    }

    function countryFilter(value) {
        return (value.Country == d.Country);
    }
    if (!tracingCountry) {
        countries.unshift(d.Country);
        countries.pop();
        //fadeCircles(d, this.id, true);
        selectedShape = d3.select(this)
        //d3.select("#year_header").text(this.id)
        //    .style("font-size", "24px");
        var cfiltered_datset = dataset.filter(countryFilter)
        fill = selectedShape.style("fill")
        traceGroup = svgChart.append("g");
        var circles2 = traceGroup.selectAll(".dot2")
            .data(cfiltered_datset, function key(d) {
                return d.Country;
            });

        circles2.enter()
            .append("circle")
            .attr("class", "dot2")
            .attr("r", cSize)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", fill)
            .style("stroke", "black")
            .style("opacity", 0.9)
            .on("mouseover", showTooltip)
            //.on("mouseover", fadeCircles)
            .on("mouseout", function (d) {
                if (svgChart._tooltipGroup) {
                    svgChart._tooltipGroup.remove();
                }
                if (!tracingCountry) {
                    fadeCircles(d, this.id, false);
                }
                //tooltip.transition()
                //    .duration(500)
                //    .style("opacity", 0);
            });

        fadeCircles(d, this.id, true);

        //bubbleChart.selectAll(".dot").remove();
        if (svgChart._tooltipGroup) {
            svgChart._tooltipGroup.remove();
        }

        generateVixNextNewCompare(countries[0], columns, countries[1], display_year);

        tracingCountry = true;
    }
}
function removeTraceCountry() {
    if (tracingCountry) {
        traceGroup.remove();
        fadeCircles(null, null, false);
        regionDropdown.attr("selected", "--Select Region--");
        d3.select("#year_header").text(display_year)
            .style("font-size", "200px");

        tracingCountry = false;
    }
}

function fadeCircles(value, selectedId, state) {
    var circles = svgChart.selectAll(".dot")
        .style("opacity", function (d) { if (d.Country != selectedId && state) return 0.2; return 1; });
}

function showTooltip(d) {
    //http://dimplejs.org/examples_viewer.html?id=scatter_vertical_lollipop 
    fadeCircles(d, this.id, true);
    var textMargin = 5,
        // The margin between the ring and the popup
        popupMargin = 10,
        // The popup animation duration in ms
        animDuration = 750,
        selectedShape = d3.select(this),
        cx = parseFloat(selectedShape.attr("cx")),
        cy = parseFloat(selectedShape.attr("cy")),
        r = parseFloat(selectedShape.attr("r")),
        opacity = 0.8,
        fill = selectedShape.style("fill"),
        dropDest = { x: 0, y: svg_height },
        // Fade the popup stroke mixing the shape fill with 60% white
        popupStrokeColor = d3.rgb(
            d3.rgb(fill).r + 0.6 * (255 - d3.rgb(fill).r),
            d3.rgb(fill).g + 0.6 * (255 - d3.rgb(fill).g),
            d3.rgb(fill).b + 0.6 * (255 - d3.rgb(fill).b)
        ),
        // Fade the popup fill mixing the shape fill with 80% white
        popupFillColor = d3.rgb(
            d3.rgb(fill).r + 0.8 * (255 - d3.rgb(fill).r),
            d3.rgb(fill).g + 0.8 * (255 - d3.rgb(fill).g),
            d3.rgb(fill).b + 0.8 * (255 - d3.rgb(fill).b)
        ),
        // The running y value for the text elements
        y = 0,
        // The maximum bounds of the text elements
        w = 0,
        h = 0,
        t,
        box,
        tipText = [tracingCountry ? d.Country + " (" + d.Year + ")" : d.Country, "Region: " + d.Region, "Population: " + formatComma(d.Population), "Income Group: " + d["Income group"]],
        translateX,
        translateY;
    if (svgChart._tooltipGroup !== null && svgChart._tooltipGroup !== undefined) {
        svgChart._tooltipGroup.remove();
    }
    svgChart._tooltipGroup = svgChart.append("g");
    // Add a ring around the data point
    svgChart._tooltipGroup.append("circle")
        .attr("class", "line-marker-circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .call(function (context) {
            context.attr("opacity", 0)
                .style("fill", "none")
                .style("stroke", fill)
                .style("stroke-width", 1);
        })
        .transition()
        .duration(animDuration / 2)
        .ease(d3.easeLinear)
        .attr("r", r + 4)
        .call(function (context) {
            context.attr("opacity", 1)
                .style("stroke-width", 2);
        });

    // Add a drop line to the x axis
    if (dropDest.y !== null) {
        svgChart._tooltipGroup.append("line")
            .attr("class", "dropline")
            .attr("x1", cx)
            .attr("y1", (cy < dropDest.y ? cy + r + 4 : cy - r - 4))
            .attr("x2", cx)
            .attr("y2", (cy < dropDest.y ? cy + r + 4 : cy - r - 4))
            .call(function (context) {
                context.style("fill", "none")
                    .style("stroke", fill)
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", ("3, 3"))
                    .style("opacity", opacity);
            })
            .transition()
            .delay(animDuration / 4)
            .duration(animDuration / 4)
            .ease(d3.easeLinear)
            // Added 1px offset to cater for svg issue where a transparent
            // group overlapping a line can sometimes hide it in some browsers
            // Issue #10
            .attr("y2", (cy < dropDest.y ? dropDest.y - 1 : dropDest.y + 1));

        svgChart._tooltipGroup.append("text")
            .text("GDP: " + formatComma(d.GDP))
            .attr("transform", "rotate(-90)")
            .attr("x", function () {
                return -(cy + this.getBBox().width + 30);
            })
            .attr("y", cx + 15)
            .style("text-anchor", "middle")
            .style("fill", "#000")
            .style("font-family", "sans-serif")
            .style("font-size", "12px")
            .style("font-weight", "bold");
    }

    // Add a drop line to the y axis
    if (dropDest.x !== null) {
        svgChart._tooltipGroup.append("line")
            .attr("class", "dropline")
            .attr("x1", (cx < dropDest.x ? cx + r + 4 : cx - r - 4))
            .attr("y1", cy)
            .attr("x2", (cx < dropDest.x ? cx + r + 4 : cx - r - 4))
            .attr("y2", cy)
            .call(function (context) {
                context.style("fill", "none")
                    .style("stroke", fill)
                    .style("stroke-width", 2)
                    .style("stroke-dasharray", ("3, 3"))
                    .style("opacity", opacity);
            })
            .transition()
            .delay(animDuration / 4)
            .duration(animDuration / 4)
            .ease(d3.easeLinear)
            // Added 1px offset to cater for svg issue where a transparent
            // group overlapping a line can sometimes hide it in some browsers
            // Issue #10
            .attr("x2", (cx < dropDest.x ? dropDest.x - 1 : dropDest.x + 1));
        svgChart._tooltipGroup.append("text")
            .text("GC Index: " + d3.format(",.2f")(d.Global_Competitiveness_Index))
            .attr("x", function () {
                return (cx - this.getBBox().width - 10);
            })
            .attr("y", cy - 5)
            .style("text-anchor", "middle")
            .style("fill", "#000")
            .style("font-family", "sans-serif")
            .style("font-size", "12px")
            .style("font-weight", "bold");
    }

    // Add a group for text
    t = svgChart._tooltipGroup.append("g");

    // Create a box for the popup in the text group
    box = t.append("rect")
        .attr("class", "tooltip");

    // Create a text object for every row in the popup
    t.selectAll(".dont-select-any").data(tipText).enter()
        .append("text")
        .attr("class", "tooltiptext")
        .text(function (d) { return d; })
        .style("font-family", "sans-serif")
        .style("color", "#000")
        .style("font-size", function (d, i) { if (i == 0) return "12px"; return "10px"; })
        .style("font-weight", function (d, i) { if (i == 0) return "bold"; return "normal"; })
        .style("text-decoration", function (d, i) { if (i == 0) return "underline"; return "none"; })
        ;

    // Get the max height and width of the text items
    t.each(function () {
        w = (this.getBBox().width > w ? this.getBBox().width : w);
        h = (this.getBBox().width > h ? this.getBBox().height : h);
    });

    // Position the text relative to the bubble, the absolute positioning
    // will be done by translating the group
    t.selectAll(".tooltiptext")
        .attr("x", 0)
        .attr("y", function () {
            // Increment the y position
            y += this.getBBox().height;
            // Position the text at the centre point
            return y - (this.getBBox().height / 2);
        });

    // Draw the box with a margin around the text
    box.attr("x", -textMargin)
        .attr("y", -textMargin)
        .attr("height", Math.floor(y + textMargin) - 0.5)
        .attr("width", w + 2 * textMargin)
        .attr("rx", 5)
        .attr("ry", 5)
        .call(function (context) {
            context.style("fill", popupFillColor)
                .style("stroke", popupStrokeColor)
                .style("stroke-width", 2)
                .style("opacity", 0.95);
        });

    // Shift the popup around to avoid overlapping the svg edge
    if (cx + r + textMargin + popupMargin + w < parseFloat(svgChart.node().getBBox().width)) {
        // Draw centre right
        translateX = (cx + r + textMargin + popupMargin);
        translateY = (cy - ((y - (h - textMargin)) / 2));
    } else if (cx - r - (textMargin + popupMargin + w) > 0) {
        // Draw centre left
        translateX = (cx - r - (textMargin + popupMargin + w));
        translateY = (cy - ((y - (h - textMargin)) / 2));
    } else if (cy + r + y + popupMargin + textMargin < parseFloat(svgChart.node().getBBox().height)) {
        // Draw centre below
        translateX = (cx - (2 * textMargin + w) / 2);
        translateX = (translateX > 0 ? translateX : popupMargin);
        translateX = (translateX + w < parseFloat(svgChart.node().getBBox().width) ? translateX : parseFloat(svgChart.node().getBBox().width) - w - popupMargin);
        translateY = (cy + r + 2 * textMargin);
    } else {
        // Draw centre above
        translateX = (cx - (2 * textMargin + w) / 2);
        translateX = (translateX > 0 ? translateX : popupMargin);
        translateX = (translateX + w < parseFloat(chart.svg.node().getBBox().width) ? translateX : parseFloat(chart.svg.node().getBBox().width) - w - popupMargin);
        translateY = (cy - y - (h - textMargin));
    }
    t.attr("transform", "translate(" + translateX + " , " + translateY + ")");
}

var regionDropdown = d3.select("#region-dropdown");

var countryDropdown = d3.select("#country-dropdown");

function createRegionDropDown(data) {
    var sortedregions = d3.map(data, function (d) { return d.Region; }).keys().sort(function (a, b) { return d3.ascending(a, b) });

    var legend = svgChart.append("g");
    legend.selectAll("rect")
        .data(sortedregions)
        .enter()
        .append("rect")
        .attr("x", 5)
        .attr("y", function (d, i) { return i * 15; })
        .attr("width", 20)
        .attr("height", "12")
        .style("fill", function (d) { return bubblecolor(d) });
    legend.selectAll("text")
        .data(sortedregions)
        .enter()
        .append("text")
        .attr("x", 27)
        .attr("class", "legendtext")
        .attr("y", function (d, i) { return 10 + i * 15; })
        .text(function (d) { return d; });

    sortedregions.splice(0, 0, "--Select Region--");
    regionDropdown.selectAll("option")
        .data(sortedregions)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });
    regionDropdown.on("change", regionSelected);
}

function regionSelected(d) {
    var selectedRegion = this.value;
    function regionFilter(value) { return value.Region == selectedRegion; }
    var regionalCountries = d3.map(dataset.filter(regionFilter), function (d) { return d.Country; }).keys().sort(function (a, b) { return d3.ascending(a, b) });
    regionalCountries.splice(0, 0, "--Select Country--");

    countryDropdown.selectAll("option").remove();
    countryDropdown.selectAll("option")
        .data(regionalCountries)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });
    countryDropdown.on("change", countrySelected);
}

function countrySelected() {
    traceCountry1(bubbleChart.select("#" + this.value)._groups[0][0]);
}

function traceCountry1(countrycircle) {
    //This is a duplicate function to handle "Traceing a country" when country is selected from combo
    removeTraceCountry();
    if (countrycircle == undefined) {
        alert("This country does not have data for the current year");
        return false;
    }
    if (moving) {
        moving = false;
        clearInterval(timer);
        playButton.text("Play");
    }

    function countryFilter(value) {
        return (value.Country == countrycircle.id);
    }
    if (!tracingCountry) {
        countries.unshift(countrycircle.id);
        countries.pop();
        selectedShape = d3.select(countrycircle)
        var cfiltered_datset = dataset.filter(countryFilter)
        fill = selectedShape.style("fill")
        traceGroup = svgChart.append("g");
        var circles2 = traceGroup.selectAll(".dot2")
            .data(cfiltered_datset, function key(d) {
                return d.Country;
            });

        circles2.enter()
            .append("circle")
            .attr("class", "dot2")
            .attr("r", cSize)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", fill)
            .style("stroke", "black")
            .style("opacity", 0.9);

        fadeCircles(countrycircle, countrycircle.id, true);

        if (svgChart._tooltipGroup) {
            svgChart._tooltipGroup.remove();
        }
        generateVixNextNewCompare(countries[0], columns, countries[1], display_year);
        tracingCountry = true;
    }
}

// Load the file data.csv and generate a visualisation based on it
d3.csv("GCI_CompleteData4.csv")
    .then(function (data) {
        dataset = data;
        yScale.domain([0, 1 + d3.max(dataset, function (d) { return +d.Global_Competitiveness_Index })]);
        svgChart.select("#x-axis").call(xAxis);
        svgChart.select("#y-axis").call(yAxis);
        createRegionDropDown(data);
        getPillars();
        generateVis3();
        createMultivariateSvg();
        generateVixNextNewCompare(countries[0], columns, countries[0], display_year);
    });

////////// slider //////////////////////////////////////////////////////////////////////////////////////////////////////
//https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763
//https://bl.ocks.org/shashank2104/d7051d80e43098bf9a48e9b6d3e10e73
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createSlider() {
    var startDate = 2007,
        endDate = 2017,
        step = 1;

    var rangeValues = d3.range(startDate, endDate, step || 1).concat(endDate);
    var svgSlider = d3.select("#slider")
        .append("svg")
        .attr("width", svg_width + margin.right)
        .attr("height", 80);

    var currentValue = 0;
    var targetValue = svg_width;

    playButton = d3.select("#play-button");

    var xScaleSlider = d3.scaleLinear()
        .domain([startDate, endDate])
        .range([0, targetValue])
        .clamp(true);
    var xAxisSlider = d3.axisBottom()
        .scale(xScaleSlider)
        .tickValues(rangeValues)
        .tickFormat(function (d) {
            return d;
        });
    var slider = svgSlider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + 12 + "," + svg_height / 9 + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", xScaleSlider.range()[0])
        .attr("x2", xScaleSlider.range()[1])
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () { slider.interrupt(); })
            .on("start drag", function () {
                currentValue = d3.event.x;
                updateSlider(currentValue);
            })
        );

    var ticksSlider = slider.insert('g', ".track-overlay")
        .attr('class', 'ticks')
        .attr('transform', 'translate(0, 8)')
        .call(xAxisSlider);

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    var label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(startDate)
        .attr("transform", "translate(0," + (-12) + ")");

    playButton
        .on("click", function () {
            var button = d3.select(this);
            if (button.text() == "Pause") {
                moving = false;
                clearInterval(timer);
                button.text("Play");
            } else {
                removeTraceCountry()
                moving = true;
                display_year = display_year == 2017 ? 2006 : display_year;
                timer = setInterval(function () {
                    display_year = display_year + 1;
                    if (display_year > 2017) {
                        moving = false;
                        clearInterval(timer);
                        playButton.text("Play");
                        display_year = 2017;
                        return false;
                    }
                    currentValue = xScaleSlider(display_year);
                    updateSlider(currentValue);
                }
                    , 1000);
                button.text("Pause");
            }
        })


    function updateSlider(value) {
        // update position and text of label according to slider scale
        var x = xScaleSlider.invert(value), index = null, midPoint, cx, xVal;
        if (step) {
            // if step has a value, compute the midpoint based on range values and reposition the slider based on the mouse position
            for (var i = 0; i < rangeValues.length - 1; i++) {
                if (x >= rangeValues[i] && x <= rangeValues[i + 1]) {
                    index = i;
                    break;
                }
            }
            midPoint = (rangeValues[index] + rangeValues[index + 1]) / 2;
            if (x < midPoint) {
                cx = xScaleSlider(rangeValues[index]);
                xVal = rangeValues[index];
            } else {
                cx = xScaleSlider(rangeValues[index + 1]);
                xVal = rangeValues[index + 1];
            }
        } else {
            // if step is null or 0, return the drag value as is
            cx = xScaleSlider(x);
            xVal = x.toFixed(3);
        }
        // use xVal as drag value
        handle.attr("cx", cx);
        label
            .attr("x", cx)
            .text(xVal);

        display_year = xVal;
        if (display_year > 2017) {
            display_year = 2007;
        }
        if (svgChart._tooltipGroup) {
            svgChart._tooltipGroup.remove();
        }
        generateVis3();
        generateVixNextNewCompare(countries[0], columns, countries[1], display_year);
    }
    ////////// End of slider //////////
}
    ////////// End of slider //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function generateVixNextNewCompare(index1, options, index2, display_year) {
    function countryFilterBar(value) {
        //filter the multivariate data according to selected countries
        if (index1 != '' && index2 != '') { return (value.Country == index1 || value.Country == index2) }
        return (value.Country == index1)
    }
    dataset_filteredC = dataset.filter(countryFilterBar); // filtered dataset by country

    generateVizagain(dataset_filteredC);
    function generateVizagain(dataset_filteredC) {
        function countryFilterBarYear(value) {
            return (value.Year == display_year)
        }
        dataset_filteredC = dataset_filteredC.filter(countryFilterBarYear);

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////Transpose data//////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        var keys3 = [];
        for (var key in dataset_filteredC[0]) {
            keys3.push(key);
        }
        keys3 = keys3.slice(2, 14);  //Selecting the pillar column names
        var arr = [];
        //Recreating the dataset in JSON object format for inputting into the bar chart

        for (i = 0; i < keys3.length; i++) {

            var str = keys3[i];
            var pos = str.lastIndexOf("pillar_");
            var str1 = str.substring(pos + 7);

            str2 = str1.replace(/_/gi, " ");

            let usr = { Pillar: str2 }
            a = dataset_filteredC[0]['Country'];
            if (options.indexOf(str2) > -1) {
                usr[a] = +dataset_filteredC[0][keys3[i]];
            }
            else { usr[a] = 0; }

            if (index2 != '') { //when another country is checked

                b = dataset_filteredC[1]['Country'];
                if (options.indexOf(str2) > -1) {
                    usr[b] = +dataset_filteredC[1][keys3[i]];
                }
                else {
                    usr[b] = 0;
                }

                usr.total = usr[a] + usr[b];
            }
            else {
                b = '';
                usr[b] = 0;
            }
            arr.push(usr);
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////     End of Transpose data       //////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////


        keysnew = [];
        for (var key in arr[0]) { keysnew.push(key); }
        keysnew2 = keysnew.slice(1, 3);
        z.domain(keysnew2);
        y0.domain(arr.map(function (d) { return d.Pillar; }));
        y1.domain(keysnew2).rangeRound([0, y0.bandwidth()]);


        var barsg = mainPillarGroup.selectAll(".pillarbar")
            .data(arr);

        barsg.selectAll("rect")
            .data(function (d, i) { return keysnew2.map(function (key) { return { key: key, value: d[key] }; }); })
            .attr("width", function (d) { return x(d.value); })
            .enter().append("rect")
            .attr("x", 0) 
            .attr("y", function (d) { return y1(d.key); })
            .attr("width", function (d) { return x(d.value); })
            .attr("height", y1.bandwidth())
            .attr("fill", function (d) { return z(d.key); }); 
        barsg.selectAll("text")
            .data(function (d, i) { return keysnew2.map(function (key) { return { key: key, value: d[key] }; }); })
            .text(function (d) { return d.value.toFixed(2); })
            .attr("x", function (d) { return x(d.value) + 10; })
            .enter().append("text")
            .text(function (d) { return d.value.toFixed(2); })
            .attr("x", function (d) { return x(d.value) + 10; })
            .attr("y", function (d) { return y1(d.key) + 7; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "9px")
            .attr("fill", "black")
            .attr("text-anchor", "middle");

        var _pillars = barsg.enter().append("g")
            .attr("class", "pillarbar")
            .attr("transform", function (d) { return "translate(0," + y0(d.Pillar) + ")"; })
            .selectAll("rect")
            .data(function (d, i) { return keysnew2.map(function (key) { return { key: key, value: d[key] }; }); })
            .attr("width", function (d) { return x(d.value); });

        _pillars.enter().append("rect")
            .attr("x", 0) 
            .attr("y", function (d) { return y1(d.key); })
            .attr("width", function (d) { return x(d.value); })
            .attr("height", y1.bandwidth())
            .attr("fill", function (d) { return z(d.key); }); 


        _pillars.exit().remove();
        barsg.exit().remove();
    }

    //Build legend for comparing miultivariate data between 2 countries
    d3.select("#svg_countries").selectAll(".legendtext").remove();
    var legend = d3.select("#svg_countries").append("g");
    legend.selectAll("rect")
        .data(keysnew2.slice().reverse())
        .enter()
        .append("rect")
        .attr("x", 125)
        .attr("y", function (d, i) { return i * 15; })
        .attr("width", 20)
        .attr("height", "12")
        .style("fill", function (d) { return z(d); });

    var legendText = legend.selectAll(".legendtext")
        .data(keysnew2.slice().reverse())
        .text(function (d) { return d; });

    legendText.enter()
        .append("text")
        .attr("x", 147)
        .attr("class", "legendtext")
        .attr("y", function (d, i) { return 10 + i * 15; })
        .text(function (d) { return d; });

    legendText.exit().remove();

}
