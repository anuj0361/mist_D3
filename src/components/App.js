import React, { Component } from "react";
import airlineData from "../data/airline-data";
import airlines from "../data/airlines";
import * as d3 from "d3";

class App extends Component {
  constructor() {
    super();
    this.state = {
      value: "",
      currentChart: undefined,
      total: 0,
      label: "All Airlines"
    };
  }

  componentDidMount() {
    this.populateData(airlineData, "All Airlines");
  }

  /*** functions to draw & update chart according to data ***/
  drawChart = data => {
    let margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    let parseTime = d3.timeParse("%H:%M:%S");
    let formatTime = d3.timeFormat("%H:%M:%S");

    let x = d3
      .scaleTime()
      .nice(d3.timeDay)
      .range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    let valueline = d3
      .line()
      .x(function(d) {
        return x(d.time);
      })
      .y(function(d) {
        return y(d.flights);
      });

    // remove previous svg's
    d3.selectAll("svg").remove();
    d3.selectAll("div.tooltip").remove();

    var div = d3
      .select("#graph")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
      d.time = parseTime(d.time);
      d.flights = +d.flights;
    });

    x.domain(
      d3.extent(data, function(d) {
        return d.time;
      })
    );
    y.domain([
      0,
      d3.max(data, function(d) {
        return d.flights;
      })
    ]);

    // Add the valueline path.
    svg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);

    // Tootip implmentation
    svg
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", function(d) {
        return x(d.time);
      })
      .attr("cy", function(d) {
        return y(d.flights);
      })
      .on("mouseover", function(d) {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        div
          .html("Time: " + formatTime(d.time) + "<br/>  Flights: " + d.flights)
          .style("left", d3.event.pageX - 60 + "px")
          .style("top", d3.event.pageY - 50 + "px");
      })
      .on("mouseout", function(d) {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add the X Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(24)
          .tickFormat(d3.timeFormat("%H:%M"))
      );

    // Add the Y Axis
    svg.append("g").call(d3.axisLeft(y));
  };

  /*** functions to manipulate data for chart generation ***/
  filterData = option => {
    if (option === "All") {
      this.populateData(airlineData, "All Airlines");
    } else {
      let data = airlineData.filter(airline => {
        if (
          typeof airline === "object" &&
          airline != null &&
          airline.hasOwnProperty("airline")
        ) {
          if (airline.airline === option) return airline;
        }
        return null;
      });
      this.populateData(data, option);
    }
  };

  populateData = (data, label) => {
    let total = 0;
    const noOfAirlines = [
      { time: "00:59:59", flights: 0 },
      { time: "01:59:59", flights: 0 },
      { time: "02:59:59", flights: 0 },
      { time: "03:59:59", flights: 0 },
      { time: "04:59:59", flights: 0 },
      { time: "05:59:59", flights: 0 },
      { time: "06:59:59", flights: 0 },
      { time: "07:59:59", flights: 0 },
      { time: "08:59:59", flights: 0 },
      { time: "09:59:59", flights: 0 },
      { time: "10:59:59", flights: 0 },
      { time: "11:59:59", flights: 0 },
      { time: "12:59:59", flights: 0 },
      { time: "13:59:59", flights: 0 },
      { time: "14:59:59", flights: 0 },
      { time: "15:59:59", flights: 0 },
      { time: "16:59:59", flights: 0 },
      { time: "17:59:59", flights: 0 },
      { time: "18:59:59", flights: 0 },
      { time: "19:59:59", flights: 0 },
      { time: "20:59:59", flights: 0 },
      { time: "21:59:59", flights: 0 },
      { time: "22:59:59", flights: 0 },
      { time: "23:59:59", flights: 0 }
    ];

    data.forEach(timeSlot => {
      if (typeof timeSlot === "object" && timeSlot != null) {
        if (
          timeSlot.hasOwnProperty("airline") &&
          timeSlot.hasOwnProperty("time")
        ) {
          let time = timeSlot.time.split(":");
          let timeStamp = +time[0];
          if (
            typeof timeStamp === "number" &&
            timeStamp >= 0 &&
            timeStamp <= 23
          )
            noOfAirlines[timeStamp].flights += 1;
        }
      }
    });

    noOfAirlines.forEach(obj => {
      total += obj.flights;
    });

    if (label !== "All Airlines") {
      label = airlines[label];
    }

    this.setState({ total: total, label: label });
    this.drawChart(noOfAirlines);
  };

  /*** functions to handle search bar events ***/
  handleChange = e => {
    this.setState({ value: e.target.value });
  };

  blurEvent = e => {
    let airlineVal = [];
    let airlineArray = Object.values(airlines);
    airlineArray.forEach(airline => {
      if (airline.toLowerCase().includes(this.state.value.toLowerCase())) {
        airlineVal.push(airline);
      }
    });
    let key = Object.keys(airlines).find(
      key => airlines[key] === airlineVal[0]
    );
    if (this.state.value === "" || key === undefined) this.filterData("All");
    else this.filterData(key);
  };

  handleKeyPress = e => {
    if (e.key === "Enter") this.blurEvent();
  };

  render() {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/">
                Airplane Flights
              </a>
            </div>
            <div className="form-group">
              <input
                type="text"
                value={this.state.value}
                className="form-control"
                style={{ width: "200px", float: "right", marginTop: "8px" }}
                placeholder="Search Flights"
                onChange={this.handleChange}
                onBlur={this.blurEvent}
                onKeyPress={this.handleKeyPress}
              />
            </div>
          </div>
        </nav>
        <div
          className="chart-container"
          style={{
            position: "relative",
            height: "40vh",
            width: "80vw",
            margin: "auto"
          }}
        >
          <h3
            style={{
              textAlign: "center",
              fontFamily: "cursive",
              color: "gray"
            }}
          >
            {this.state.total} {this.state.label}
          </h3>
          <div id="graph" className="aGraph" />
        </div>
      </div>
    );
  }
}

export default App;
