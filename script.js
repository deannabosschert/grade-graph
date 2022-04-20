    const gistUrl =
        "https://gist.githubusercontent.com/deannabosschert/1e69e956d59aadd46f0548707db2a97a/raw/77ad9d1a025617443820fd368d247a3909ddd506/cijfers_bachelor_kommas.csv"
    const graphHeight = 600
    const graphWidth = 800

    const margin = 50 // margin around the graph
          width = graphWidth - margin - margin, // width of the graph
          height = graphHeight - margin - margin // height of the graph

    const svg = d3.select("#grade_graph") // append svg object to the body of the page
        .append("svg")
        .attr("width", width + (margin * 2))
        .attr("height", height + (margin * 2))
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")")

    function toNumber(string) {
        return parseFloat(string.replace(',', '.'))
    }

    d3.csv(gistUrl, // read the data
        (d) => ({ // format the data
            course: d.vak,
            project: d.project,
            date: d3.timeParse("%Y-%m-%d")(d.datum), // parse the date
            studypoints: parseFloat(d.studiepunten), // parse the number
            grade: toNumber(d.cijfer), // parse the number 
            gradeDecimal: toNumber(d.cijfer).toFixed(1), // parse the number and round it to 1 decimal
            gradeSize: toNumber(d.cijfergrootte) // sum of the grade x studypoints
        }),
        (data) => {
            // X-AXIS
            const x = d3.scaleTime() // scale for the x axis (date format)
                .domain(d3.extent(data, (d) => d.date)) // extent = highest and lowest value
                .range([25, (width - 10)]) // range = start and end value
            svg.append("g")
                .attr("transform", "translate(0," + height + ")") // translate the x axis to the bottom of the graph
                .call(d3.axisBottom(x))

            // Y-AXIS    
            const y = d3.scaleLinear() // scale for the y axis
                .domain([5, 10]) //
                .range([height, 20])
            svg.append("g")
                .call(d3.axisLeft(y))

            // Z-AXIS 
            const z = d3.scaleLinear() // scale for the bubble size
                .domain([0, 35])
                .range([4, 40])
            const bubbleColor = d3.scaleOrdinal() // scale for the bubble color
                .domain(["afstuderen", "project tech", "project web", "project beyond", "minor webdevelopment", "slc", "information design", "stage"])
                .range(d3.schemeSet2) // color scheme from d3

            // X-AXIS LABEL
            const xLabel = svg.append("g")
                .append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + [(graphWidth / 2) - 30, graphHeight - 60] + ")")
                .attr("font-size", 14)
                .attr("text-height", 14)
                .attr("fill", "black")
                .text("date")

            // Y-AXIS LABEL
            const yLabel = svg.append("g")
                .append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + [0, 0] + ")")
                .attr("font-size", 14)
                .attr("text-height", 14)
                .attr("fill", "black")
                .text("grade")


            // TOOLTIPS
            const tooltip = d3.select("#grade_graph") // define the tooltip div (hidden until hover)
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "#202020")
                .style("border-radius", "5px")
                .style("padding", "10px")

            const showTooltip = function (d) {
                tooltip
                    .transition() // fade in tooltip
                    .duration(200) // tooltip transition duration
                tooltip
                    .style("opacity", 1)
                    .html("Course: <span>" + d.course + "</span>, graded with a <b>" + d.gradeDecimal + "</b> and worth <b>" + d.studypoints + "</b> study points")
                    .style("left", (d3.mouse(this)[0] + 30) + "px") // position the tooltip
                    .style("top", (d3.mouse(this)[1] + 30) + "px") // position the tooltip
            }

            const moveTooltip = function (d) {
                tooltip
                    .style("left", (d3.mouse(this)[0] + 30) + "px") // move the tooltip
                    .style("top", (d3.mouse(this)[1] + 30) + "px")
            }

            const hideTooltip = (d) => {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
            }


            // DATA POINTS
            const bubbles = svg.append('g').selectAll("dot").data(data).enter() // create circle container
            const gradeBubble = bubbles
                .append("circle") // append one dot per data
                .attr("class", "gradeBubble") // give each dot a class called "gradeBubble"
                .attr("cx", (d) => x(d.date)) // x position of the circle
                .attr("cy", (d) => y(d.grade)) // y position of the circle
                .attr("r", (d) => z(d.studypoints)) // radius of the circle
                .style("fill", (d) => bubbleColor(d.project))
                .style("opacity", 0.75) // little transparency in case of bubbles overlap
                .on("mouseover", showTooltip) // trigger the function on mousemove
                .on("mousemove", moveTooltip) // trigger the function on mousemove
                .on("mouseleave", hideTooltip) // trigger the function on mouseout

            const gradeLabel = bubbles
                .append("text")
                .attr("class", "gradeLabel") // give each dot a class called "gradeLabel"
                .text((d) => d.grade)
                .attr("x", (d) => x(d.date))
                .attr("y", (d) => y(d.grade))
                .attr("transform", "translate(" + 0 + "," + 15 + ")")
                .attr("font-size", 12)
                .attr("text-anchor", "middle")
                .attr("text-height", 12)
                .attr("fill", "black")
        })