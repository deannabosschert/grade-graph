    const gistUrl =
        "https://gist.githubusercontent.com/deannabosschert/1e69e956d59aadd46f0548707db2a97a/raw/77ad9d1a025617443820fd368d247a3909ddd506/cijfers_bachelor_kommas.csv"
    const graphHeight = 600
    const graphWidth = 800

    const margin = 50 // margin around the graph
    width = graphWidth - margin - margin, // width of the graph
        height = graphHeight - margin - margin // height of the graph

    let svg = d3.select("#grade_graph") // append svg object to the body of the page
        .append("svg")
        .attr("width", width + (margin * 2))
        .attr("height", height + (margin * 2))
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")")

    d3.csv(gistUrl, // read the data
        (d) => ({
                date: d3.timeParse("%Y-%m-%d")(d.datum),
                cijfer: d.cijfer,
                cijfergrootte: d.cijfergrootte,
                vak: d.vak,
                project: d.project
            } // first, format letiables
        ) // first, format letiables
        ,
        (data) => {
            let x = d3.scaleTime() // scale for the x axis (date format)
                .domain(d3.extent(data, (d) => d.date))
                .range([25, (width - 10)])


            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))

            let y = d3.scaleLinear() // scale for the y axis
                .domain([5, 10])
                .range([height, 20])
            svg.append("g")
                .call(d3.axisLeft(y))

            let z = d3.scaleLinear() // scale for the bubble size
                .domain([0, 400])
                .range([4, 40])

            let myColor = d3.scaleOrdinal() // scale for the bubble color
                .domain(["afstuderen", "project tech", "project web", "project beyond", "minor webdevelopment",
                    "slc", "information design", "stage"
                ])
                .range(d3.schemeSet2)

            let tooltip = d3.select("#grade_graph") // define the tooltip div (hidden until hover)
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "#202020")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("color", "white")


            let showTooltip = function (d) {
                tooltip
                    .transition() // fade in tooltip
                    .duration(200) // tooltip transition duration
                tooltip
                    .style("opacity", 1)
                    .html("Course: " + d.vak + ", graded with a: " + d.cijfer)
                    .style("left", (d3.mouse(this)[0] + 30) + "px") // position the tooltip
                    .style("top", (d3.mouse(this)[1] + 30) + "px") // position the tooltip
            }
            let moveTooltip = function (d) {
                tooltip
                    .style("left", (d3.mouse(this)[0] + 30) + "px") // move the tooltip
                    .style("top", (d3.mouse(this)[1] + 30) + "px") // move the tooltip
            }
            let hideTooltip = (d) => {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
            }

            let xLabel = svg.append("g")
                .append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + [(graphWidth / 2) - 20, graphHeight - 20] + ")")
                .attr("font-size", 14)
                .attr("text-height", 14)
                .attr("fill", "black")
                .text("date")

            let yLabel = svg.append("g")
                .append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + [0, 0] + ")")
                .attr("font-size", 14)
                .attr("text-height", 14)
                .attr("fill", "black")
                .text("grade")


            let circles = svg.append('g').selectAll("dot").data(data).enter() // create circle container
            let dots = circles
                .append("circle") // append one dot per data
                .attr("class", "gradeBubble") // give each dot a class called "gradeBubble"
                .attr("cx", (d) => x(d.date)) // x position of the circle
                .attr("cy", (d) => {
                    let gradeNumber = parseFloat(d.cijfer.replace(',', '.')) // turn gradeNumber into number without rounding
                    return y(gradeNumber)
                })
                .attr("r", (d) => {
                    let gradeSize = parseFloat(d.cijfergrootte.replace(',', '.')) // turn into number without rounding
                    return z(gradeSize)
                })
                .style("fill", (d) => myColor(d.project))
                .style("opacity", 0.75)
                .on("mouseover", showTooltip) // trigger the function on mousemove
                .on("mousemove", moveTooltip) // trigger the function on mousemove
                .on("mouseleave", hideTooltip) // trigger the function on mouseout

            let circleText = circles
                .append("text")
                .attr("class", "gradeLabel") // give each dot a class called "gradeLabel"
                .text((d) => d.cijfer)
                .attr("x", (d) => x(d.date))
                .attr("y", (d) => {
                    let gradeNumber = parseFloat(d.cijfer.replace(',',
                        '.')) // turn gradeNumber into number without rounding
                    return y(gradeNumber)
                })
                .attr("transform", "translate(" + 0 + "," + 15 + ")")
                .attr("font-size", 12)
                .attr("text-anchor", "middle")
                .attr("text-height", 12)
                .attr("fill", "black")
        })