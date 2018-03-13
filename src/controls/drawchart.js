import * as d3 from 'd3';
import {Button} from './button'

export default function DrawChart() {
    let margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 150 - margin.left - margin.right,
        height = 120 - margin.top - margin.bottom,
        padding  = (margin.left+margin.right)/2;


    let line = null;
    let pts = null;
    let xScale = null;
    let yScale = null;
    let xattr = null;
    let yattr = null;

    function plot(selection) {
        selection.each(function (d, i)  {
            let root = d3.select(this);

            //svg_render_pts.call(this, d, i);

            root.select('.line')
                .attr('d', line.get(this)(d.line));

            root.select('.area')
                .attr('d', area.get(this)(d.area));
        });
    }

    plot.create = function(selection) {
        let g = selection
            .attr('class', 'plot')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('transform', `translate(${margin.left},${margin.top})`);

        let myplt = g.selectAll(".line").data([pts]);

        myplt.enter()
            .append("path")
            .merge(myplt)
            .attr("class", "line")
            .attr("transform", "translate(" + (2*padding) + "," + 0 + ")")
            .attr("d", line)
            .attr("fill","none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1);

        myplt.exit().remove();

        let xaxis = g.selectAll('.pxaxis').data([0]);
        xaxis
            .enter()
            .append("g")
            .merge(xaxis)
            .attr("class", "pxaxis")
            .attr("transform", "translate(" + (2*padding) + "," + (height - padding ) + ")")
            .call(d3.axisBottom(xScale).tickSize(padding / 4));//.tickFormat(d3.format(".3g")));

        xaxis.exit().remove();

        let yaxis = g.selectAll('.pyaxis').data([0]);
        yaxis.enter()
            .append("g")
            .merge(yaxis)
            .attr("class", "pyaxis")
            .attr("transform", "translate(" + (2*padding) + "," + 0 + ")")
            .call(d3.axisLeft(yScale).tickSize(padding / 4));

        yaxis.exit().remove();

        let ylabel =g.selectAll('.ylabel').data([0]);

        ylabel.enter()
            .append("text")
            .merge(ylabel)
            .attr("class","ylabel")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + padding/2 + "," + (height / 2) + ")rotate(-90)")
            .text(yattr).style("font-size", 6 + "px");

        let xlabel = g.selectAll('.xlabel').data([1]);
        xlabel.enter()
            .append("text")
            .merge(xlabel)
            .attr("class","xlabel")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width / 2) + "," + (height+padding/2) + ")")
            .text(xattr).style("font-size", 6 + "px");

        g.selectAll(".tick").selectAll("text").style("font-size", 5 + "px");


        let decrease = () => {
            console.log("decrease");
        }

        let btn = Button()
            .x(width-padding)// - padding) // X Location
            .y(height+padding/2) // Y Location
            .labels(["-"]) // Array of round-robin labels
            .callback(decrease) // User callback on click
            .fontSize(6) // Font Size
            .color("black") // Button text color
            .fill("steelblue") // Button fill
            .fillHighlight("cyan") // Button fill when highlighted
            .opacity(0.8) // Opacity

        g.call(btn)

        let increase = () => {
            console.log("increase");//this.option = "increase";
        }

        let btn2 = Button()
            .x(width) // X Location
            .y(height+padding/2) // Y Location
            .labels(["+"]) // Array of round-robin labels
            .callback(increase) // User callback on click
            .fontSize(6) // Font Size
            .color("black") // Button text color
            .fill("steelblue") // Button fill
            .fillHighlight("cyan") // Button fill when highlighted
            .opacity(0.8) // Opacity

        g.call(btn2)

        let handle = g.selectAll(".pbar").data([0]);

        handle.enter()
            .append("rect")
            .merge(handle)
            .attr("class", "pbar");

        handle.exit().remove();

    };
/*
    plot.size = function(_) {
        if (!arguments.length) return [width, height];
        [width, height] = _;
        return this;
    };

    plot.x = function(_) {
        x = _;
        return this;
    };

    plot.y = function(_) {
        y = _;
        return this;
    };

    plot.line = function(_) {
        line = _;
        return this;
    };
*/
    plot.createline = function(data) {

        if(data[0].length===2)
        {
            xScale = d3.scaleLog()//.nice()//;scaleLinear()
            .domain([data[data.length - 1][0]+Number.EPSILON,data[0][0]+Number.EPSILON]) // input
            .range([0, width - padding]).clamp(true); // output

            yScale = d3.scaleLinear()
                .domain([data[data.length - 1][1],data[0][1]]) // input
                .range([0, height - padding]); // output

            line = d3.line()
            .x((d,i) => {//console.log("i = ",i, 'd= ', d);//, psize[i][0]);
                return xScale(parseFloat(d[0]) + Number.EPSILON);
            }) // set the x values for the line generator
            .y((d,i) => {
                return yScale(parseFloat(d[1]));
            });

            xattr = "persistence";
            yattr = "partitions";
        }
        else
        {
            xScale = d3.scaleLinear()
                .domain([0, data.length-1]) // input
                .range([0, width - padding]).clamp(true); // output

            yScale = d3.scaleLinear()
                .domain([data[data.length-1], data[0]]) // input
                .range([height - padding, 0]); // output

            line = d3.line()
                .x((d, i) => {
                    return xScale(i);
                })
                .y(d => {
                    return yScale(d);
                });

            xattr = "size";
            yattr = "partitions";
        }
        pts = data;

        return this;
    };
/*
    plot.area = function(_) {
        area = _;
        return this;
    };

    plot.color = function(_) {
        color = _;
        return this;
    };
*/
    return plot;
}