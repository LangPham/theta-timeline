import { DataSet } from "./DataSet";
import { Margin } from "../interfaces/Margin";
import * as d3 from "d3";
import moment from "moment";
import Swal from "sweetalert2";
import { Point } from "./Point";
import { v4 as uuid } from "uuid";

export class TimeLine {
  margin: Margin;
  data: DataSet[];
  history: Map<string, any>;
  width: number;
  height: number;
  xTimeDomain: Date[];
  svg: any;
  xTimeScale: any;
  xAxis: any;
  yGroupScale: any;
  yAxis: any;
  zoom: any;
  yGroupDomain: string[] = [];
  drap: any;
  drapTarget: any = null;

  constructor(id: string, data: DataSet[], group: string[], option?: any) {
    this.margin = { top: 0, bottom: 0, left: 0, right: 0 };
    this.width = option?.width ?? 1200;
    this.height = option?.height ?? 500;
    if (option.margin != undefined) {
      this.margin.top = option.margin.top ?? 20;
      this.margin.bottom = option.margin.bottom ?? 20;
      this.margin.left = option.margin.left ?? 40;
      this.margin.right = option.margin.top ?? 20;
    }

    this.xTimeDomain = [
      moment().add(-5, "days").toDate(),
      moment().add(45, "days").toDate(),
    ];

    this.data = data;
    this.svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .attr("width", this.width)
      .attr("height", this.height)
      .on("dblclick", (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (event.target.nodeName == "svg") {
          this.createItem(event);
        }
      });

    // For x axis
    this.xTimeScale = d3
      .scaleTime()
      .domain([
        Date.now() - 24 * 60 * 60 * 1000 * 5,
        Date.now() + 24 * 60 * 60 * 1000 * 45,
      ])
      .nice(2)
      .range([this.margin.left, this.width - this.margin.right]);

    // For x axis
    this.xAxis = this.svg.append("g").call(this.xAxisFunc, this.xTimeScale);

    // For y axis
    this.yGroupDomain = group;
    this.yGroupScale = d3
      .scaleBand()
      .domain(this.yGroupDomain)
      .range([this.height - this.margin.bottom, this.margin.top])
      .padding(0.3);

    // For y axis
    this.yAxis = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(this.yGroupScale));

    this.zoom = d3
      .zoom()
      .extent([
        [this.margin.left, 0],
        [this.width - this.margin.right, this.height],
      ])
      .translateExtent([
        [this.margin.left, -Infinity],
        [this.width - this.margin.right, Infinity],
      ])
      .on("zoom", this.zoomed);

    this.drap = d3
      .drag()
      .on("start", this.dragstart)
      .on("drag", this.dragging)
      .on("end", this.dragend);

    this.history = new Map<string, Object>();
  }

  xAxisFunc = (g: any, xScale: any) => {
    g.attr(
      "transform",
      `translate(0,${this.height - this.margin.bottom} )`
    ).call(d3.axisBottom(xScale));
  };

  invertYGroup = (clickPoint: Point) => {
    var eachBand = this.yGroupScale.step();
    var index = Math.round(clickPoint.y / eachBand);
    let domain = [...this.yGroupDomain];
    let group = domain.reverse()[index - 1];
    return group;
  };

  createItem = (event: any) => {
    let clickPoint: Point = { x: event.x, y: event.y };
    let transform = d3.zoomTransform(event.target);
    let xz = transform.rescaleX(this.xTimeScale);
    let tfx = transform.invert([clickPoint.x, clickPoint.y]);
    let start = this.xTimeScale.invert(tfx[0]);
    let remainder = moment(start).get("minutes") % 15;
    start = moment(start).add(-remainder, "minutes").toDate();
    let group = this.invertYGroup(clickPoint);
    let data = {
      id: uuid(),
      group: group,
      content: "newTeam",
      start: start,
      end: moment(start).add(60, "minutes").toDate(),
      status: "draft",
    };

    let groug_rect = d3.select(event.target).select(".rect");
    let item = groug_rect.append("g").attr("type", "rect");

    // Add content for item
    item
      .data([data])
      .append("foreignObject")
      .attr("x", () => {
        return xz(data.start);
      })
      .attr("y", () => {
        return this.yGroupScale(data.group);
      })
      .attr("width", () => {
        return xz(data.end) - xz(data.start);
      })
      .attr("height", this.yGroupScale.bandwidth())
      .append("xhtml:div")
      .attr("style", () => {
        let style =
          "display:flex;align-items:center;justify-content:center;height:inherit;flex-direction:column;";
        switch (data.status) {
          case "accepted": {
            return style + "color:white; background-color:gray;";
          }
          default:
            return style + "color:white;background-color:ForestGreen;";
        }
      })
      .html(() => {
        let content = data.content;
        content = content;
        let start = moment(data.start).format("DD/MM/YYYY HH:mm");
        let end = moment(data.end).format("DD/MM/YYYY HH:mm");
        return `<span style="white-space:nowrap;">${content}</span><span style="white-space:nowrap;" class="start">${start}</span><span class="end" style="white-space:nowrap;">${end}</span>`;
      });

    // Add rect
    item
      .append("rect")
      .call(this.drap)
      .attr("x", () => {
        return xz(data.start);
      })
      .attr("y", () => {
        return this.yGroupScale(data.group);
      })
      .attr("width", () => {
        return xz(data.end) - xz(data.start);
      })
      .attr("height", this.yGroupScale.bandwidth())
      .attr("data-id", () => {
        return data.id;
      })
      .attr("fill", "#044B94")
      .attr("fill-opacity", "0.1")
      .attr("stroke", "black")
      .on("click", this.onClickItem);

    this.history.set(data.id, { id: data.id, action: "new" });
  };

  zoomed = (event: any, aaa: any) => {
    let xz = event.transform.rescaleX(this.xTimeScale);

    this.svg
      .selectAll(".rect>g[type=rect]")
      .selectChildren()
      .attr("x", function (data: DataSet) {
        return xz(data.start);
      })
      .attr("width", function (data: DataSet) {
        return xz(data.end) - xz(data.start);
      });

    this.xAxis.call(this.xAxisFunc, xz);
  };

  draw = () => {
    console.log("draw", this)
    let item = this.svg
      .append("g")
      .attr("class", "rect")
      .attr("fill", "none")
      .selectAll("g")
      .data(this.data)
      .enter()
      .append("g")
      .attr("type", "rect");

    // Add content for item
    item
      .append("foreignObject")
      .attr("x", (data: DataSet, index: number) => {
        return this.xTimeScale(data.start);
      })
      .attr("y", (data: DataSet, index: number) => {
        return this.yGroupScale(data.group);
      })
      .attr("width", (data: DataSet, index: number) => {
        return this.xTimeScale(data.end) - this.xTimeScale(data.start);
      })
      .attr("height", this.yGroupScale.bandwidth())
      .append("xhtml:div")
      .attr("style", (data: DataSet, index: number) => {
        let style =
          "display:flex;align-items:center;justify-content:center;height:inherit;flex-direction:column;";
        switch (data.status) {
          case "accepted": {
            return style + "color:white; background-color:gray;";
          }
          default:
            return style + "color:white;background-color:ForestGreen;";
        }
      })
      .html((data: DataSet, index: number) => {
        let content = data.content;
        content = content;
        let start = moment(data.start).format("DD/MM/YYYY HH:mm");
        let end = moment(data.end).format("DD/MM/YYYY HH:mm");
        return `<span style="white-space:nowrap;">${content}</span><span style="white-space:nowrap;" class="start">${start}</span><span class="end" style="white-space:nowrap;">${end}</span>`;
      });

    // Add rect
    item
      .append("rect")
      .call(this.drap)
      .attr("x", (data: DataSet, index: number) => {
        return this.xTimeScale(data.start);
      })
      .attr("y", (data: DataSet, index: number) => {
        return this.yGroupScale(data.group);
      })
      .attr("width", (data: DataSet, index: number) => {
        return this.xTimeScale(data.end) - this.xTimeScale(data.start);
      })
      .attr("height", this.yGroupScale.bandwidth())
      .attr("data-id", (data: DataSet, index: number) => {
        return data.id;
      })
      .attr("fill", "#044B94")
      .attr("fill-opacity", "0.1")
      .attr("stroke", "black")
      .on("click", this.onClickItem);

    this.svg
      .call(this.zoom)
      .transition()
      .duration(150)
      .call(this.zoom.scaleTo, 50, [this.xTimeScale(Date.now()), 0]);
  };

  onClickItem = (event: any, data: any) => {
    if (data.status == "accepted") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return null;
    }

    Swal.fire({
      title: "Action",      
      input: "radio",
      inputOptions: {
        edit: "Edit",
        remove: "Remove",
      },
      inputValidator: (value) => {
        if (!value) {
          return "You need to choose something!";
        }
        return null;
      },
      showCancelButton: true,
    }).then((result) => {
      switch (result.isConfirmed) {
        case true: {
          if (result.value == "edit") {
            let inputValue = moment(data.end).diff(
              moment(data.start),
              "minutes"
            );
            Swal.fire({
              title: "Time long for item?",
              icon: "question",
              input: "range",
              inputLabel: "Minute",
              inputAttributes: {
                min: "60",
                max: "480",
                step: "15",
              },
              inputValue: inputValue,
            }).then((result) => {
              if (result.isConfirmed) {
                data.end = moment(data.start)
                  .add(parseInt(result.value), "minutes")
                  .toDate();
                let transform = d3.zoomTransform(event.target);
                let xz = transform.rescaleX(this.xTimeScale);

                let node = d3.select(event.target.parentNode);
                this.updateItem(node, data, xz);
              }
            });
          } else {
            Swal.fire({
              title: "Do you want delete?",
              showCancelButton: true,
              confirmButtonText: "Yes",
            }).then((result) => {
              if (result.isConfirmed) {
                let node = d3.select(event.target.parentNode);
                this.removeItem(node, data);
              }
            });
          }
        }
        default:
          null;
      }
    });
  };

  historyUpdate = (ob: any) => {
    if (this.history.has(ob.id)) {
      let his = this.history.get(ob.id);
      if (his.action == "new" && ob.action == "remove") {
        this.history.delete(ob.id);
      } else if (his.action == "update" && ob.action == "remove") {
        this.history.set(ob.id, ob);
      }
    } else {
      this.history.set(ob.id, ob);
    }
  };

  updateItem = (node: any, data: any, xz: any) => {
    node
      .selectChildren()
      .attr("width", xz(data.end) - xz(data.start))
      .attr("x", xz(data.start))
      .attr("y", this.yGroupScale(data.group))
      .attr("stroke", "black");
    node
      .select("foreignObject .end")
      .text(moment(data.end).format("DD/MM/YYYY HH:mm"));
    node
      .select("foreignObject .start")
      .text(moment(data.start).format("DD/MM/YYYY HH:mm"));

    this.historyUpdate({ id: data.id, action: "update" });
  };

  removeItem = (node: any, data: any) => {
    node.remove();
    this.historyUpdate({ id: data.id, action: "remove" });
  };

  dragstart = (event: any, data: any) => {
    if (data.status == "accepted") {
      return null;
    }
    let node = event.sourceEvent.srcElement;
    d3.select(node)
      .raise()
      .attr("stroke", "red")
      .attr("style", "cursor: -webkit-grab; cursor: grab;");
    this.drapTarget = { node: node, event: event, newData: null };
  };

  dragging = (event: any, data: any) => {
    if (data.status == "accepted") {
      // event.preventDefault()
      return null;
    }
    var transform = d3.zoomTransform(event.sourceEvent.srcElement);
    let xz = transform.rescaleX(this.xTimeScale);
    let grid =
      xz(moment(data.start).add(15, "minutes").toDate()) - xz(data.start);
    let step = Math.round(event.x / grid - this.drapTarget.event.x / grid);
    d3.select(this.drapTarget.node)
      .attr("x", () => {
        let step = Math.round(event.x / grid - this.drapTarget.event.x / grid);
        let newStart = moment(data.start)
          .add(15 * step, "minutes")
          .toDate();
        let newEnd = moment(data.end)
          .add(15 * step, "minutes")
          .toDate();
        this.drapTarget.newData = { start: newStart, end: newEnd };
        return xz(newStart);
      })
      .attr("y", () => {
        let clickPoint: Point = { x: event.x, y: event.y };
        let group = this.invertYGroup(clickPoint);

        this.drapTarget.newData.group = group;
        return this.yGroupScale(group);
      });
  };

  dragend = (event: any, data: any) => {
    if (data.status == "accepted") {
      return null;
    }
    let node = d3.select(this.drapTarget.node.parentNode);

    if (this.drapTarget.newData != null) {
      this.drapTarget.newStart;
      let transform = d3.zoomTransform(event.sourceEvent.target);
      let xz = transform.rescaleX(this.xTimeScale);
      data.start = this.drapTarget.newData.start;
      data.end = this.drapTarget.newData.end;
      data.group = this.drapTarget.newData.group;
      this.updateItem(node, data, xz);
    }
  };
}

