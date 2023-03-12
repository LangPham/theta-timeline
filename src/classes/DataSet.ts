
export class DataSet {
  id: string;
  group: string;
  content: string;
  start: Date;
  end: Date;
  status: string;
  constructor(id: string, group: string, content: string, start: Date, end: Date, status: string) {
    this.id = id;
    this.group = group;
    this.content = content;
    this.start = start;
    this.end = end;
    this.status = status;
  }
}