import {TimeLine, DataSet} from "../src"
import moment from "moment";
import { faker } from '@faker-js/faker';

let datas: DataSet[] = [];
//   {
//     id: 1,
//     group: "one",
//     content: "Dragon",
//     start: new Date(2023, 2, 9, 19, 0, 0),
//     end: new Date(2023, 2, 9, 20, 0, 0),
//     editable: true
//   },

function createRandomGroup(): string {
  return faker.company.name();
}

let count = 10;
let groups_arr: string[] = [];

for (let i = 0; i++, i <= 5; ) {
  groups_arr.push(faker.name.firstName())
}

let dru_arr = [60, 90, 120];
for (let i = 0; i++, i <= count; ) {
  let start = moment().add(
    dru_arr[Math.floor(Math.random() * dru_arr.length)],
    "minutes"
  );
  let remainder = 15 - (start.minute() % 15);
  start = moment(start).add(remainder + i * 120, "minutes").seconds(0);
  let end = moment(start).add(
    dru_arr[Math.floor(Math.random() * dru_arr.length)],
    "minutes"
  );
  let data = {
    id: i.toString(),
    group: groups_arr[Math.floor(Math.random() * groups_arr.length)],
    content: faker.address.cityName() ,
    start: start.toDate(),
    end: end.toDate(),
    editable: faker.datatype.boolean(),
  };
  datas.push(data);
}

let tl = new TimeLine("mychart", datas, groups_arr, {
  width: 1000,
  height: 500,
  margin: { top: 20, bottom: 20, left: 0, right: 0},
});
tl.draw();

