import * as d3 from 'd3';
import {Button} from './button'
import {publish, subscribe} from "../utils";


export default function DrawChart() {
    let margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 150 - margin.left - margin.right,
        height = 120 - margin.top - margin.bottom,
        padding  = (margin.left+margin.right)/2;

    let line = null;
    let pts = null;
    let uniqueP = [];
    let xScale = null;
    let yScale = null;
    let xattr = null;
    let yattr = null;
    let cur_x = null;
    let range_x = null;
    let g = null;

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
        g = selection
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
            .attr("stroke", "cyan")
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

        let mbutton = g.selectAll('.mbutton').data([0]);
        mbutton.enter()
            .append('g')
            .merge(mbutton)
            .attr('class', 'mbutton')
            .call(btn);
        mbutton.exit().remove();

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

        let pbutton = g.selectAll('.pbutton').data([0]);

        pbutton.enter()
            .append('g')
            .merge(pbutton)
            .attr('class', 'pbutton')
            .call(btn2);

        pbutton.exit().remove();

        let cx = (pts[0].length===2)?xScale(cur_x+Number.EPSILON):xScale(cur_x);

        let handle = g.selectAll(".pbar").data([0]);

        handle.enter()
            .append("rect")
            .merge(handle)
            .attr("x", (2*padding+cx) )//+ padding*3/2 - 2)
            .attr("y", 0)
            .attr("width", 4)
            .attr("height", height)
            .attr("class", "pbar")
            .attr("fill", "blue")
            .attr("opacity", "0.5")
            .call(d3.drag()
            .on("start.interrupt", ()=>{ console.log("Inter")})
            .on("start drag", () =>
            {
                //console.log("Dragging")
                if(xattr === 'persistence'){
                    g.select(".pbar").attr("x", padding*2 + xScale(xScale.invert(d3.event.x - padding*2)));
                    cur_x = xScale.invert(d3.event.x - padding*2) - Number.EPSILON;
                }
                else
                {
                    //g.select(".pbar").attr("x", d3.event.x);
                    g.select(".pbar").attr("x", 2*padding + xScale(xScale.invert(d3.event.x-2*padding)));
                    cur_x = parseInt(xScale.invert(d3.event.x - padding*2));
                }
                //console.log("chart.change",xattr,cur_x);
                publish("chart.change",xattr,cur_x);
            }));

        handle.exit().remove();
        subscribe('chart.change', updatechart);

    };
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
            cur_x = data[0][0];
            range_x = [data[data.length - 1][0],data[0][0]];
            data.forEach(d=>{
                uniqueP.push(d[0]);
            });
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
            cur_x = data.length-1;
            range_x = [0,data.length - 1];
        }
        pts = data;

        return this;
    };

    function increase(){
        //console.log(xattr+".Increase"+cur_x, range_x);
        if(xattr === 'persistence')
        {
            cur_x =(getindex(cur_x,uniqueP)>0)?uniqueP[getindex(cur_x,uniqueP)-1]:range_x[1];
        }
        else
        {
            cur_x =(cur_x<range_x[1])?cur_x+1:range_x[1];
        }
        publish("chart.change",xattr,cur_x);
    }
    function decrease(){
        //console.log(xattr+".Decrease"+cur_x, range_x);
        if(xattr === 'persistence')
        {
            cur_x =(getindex(cur_x,uniqueP)<uniqueP.length-1)?uniqueP[getindex(cur_x,uniqueP)+1]:range_x[0];
        }
        else
        {
            cur_x =(cur_x>range_x[0])?cur_x-1:range_x[0];
        }
        publish("chart.change",xattr,cur_x);
    }
    function getindex(val,arr){
        let outindex;
        let min;
        outindex = arr.indexOf(val);
        if(outindex === -1){
            outindex = 0;
            for (let i in arr) {
                min = Math.abs(arr[outindex] - val);
                if (Math.abs(arr[i] - val) < min) {
                    outindex = i;
                }
            }
        }
        return outindex;
    }
    function updatechart(msg,attr,val){
        //console.log(attr,val)
        let cx;
        if(xattr === 'persistence' && attr === 'persistence')
        {
            cur_x = val;
            cx = xScale(cur_x+Number.EPSILON);
            g.select(".pbar")//.data([cx])
                .attr("x", cx + 2*padding)
                .attr("y", 0)
                .attr("width", 4)
                .attr("height", height)
                .attr("class", "pbar")
                .attr("fill", "blue")
                .attr("opacity", "0.5");
        }
        else if(xattr === 'size' && attr === 'size')
        {
            cur_x = val;
            cx = xScale(cur_x);
            g.select(".pbar")//.data([cx])
                .attr("x", cx + 2*padding)
                .attr("y", 0)
                .attr("width", 4)
                .attr("height", height)
                .attr("class", "pbar")
                .attr("fill", "blue")
                .attr("opacity", "0.5");
        }

    };

    return plot;
}