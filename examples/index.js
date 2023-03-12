import { TimeLine, DataSet } from "../dist";
import moment from "moment";
import { faker } from '@faker-js/faker';

let datas = [];
//   {
//     id: 1,
//     group: "one",
//     content: "Dragon",
//     start: new Date(2023, 2, 9, 19, 0, 0),
//     end: new Date(2023, 2, 9, 20, 0, 0),
//     status: "draft"
//   }

let count = 10;
let groups_arr = ["one", "two", "three", "four", "five"];
let status_arr = ["accepted", "draft"];

let dru_arr = [60, 90, 120];
for (let i = 0; i++, i <= count; ) {
  let start = moment().add(
    dru_arr[Math.floor(Math.random() * dru_arr.length)],
    "minutes"
  );
  let remainder = 15 - (start.minute() % 15);
  start = moment(start).add(remainder + i * 120, "minutes");
  let end = moment(start).add(
    dru_arr[Math.floor(Math.random() * dru_arr.length)],
    "minutes"
  );
  let data = {
    id: i.toString(),
    group: groups_arr[Math.floor(Math.random() * groups_arr.length)],
    content: faker.company.name(),
    start: start.toDate(),
    end: end.toDate(),
    status: status_arr[Math.floor(Math.random() * status_arr.length)],
  };
  datas.push(data);
}

let tl = new TimeLine("mychart", datas, groups_arr, {
  width: 1000,
  height: 500,
  margin: { top: 20, bottom: 20, left: 50 },
});
tl.draw();
// console.log(tl);
