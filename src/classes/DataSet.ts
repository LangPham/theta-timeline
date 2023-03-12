
export class DataSet {
  id: string;
  group: string;
  content: string;
  start: Date;
  end: Date;
  editable: boolean;
  constructor(id: string, group: string, content: string, start: Date, end: Date, editable: boolean) {
    this.id = id;
    this.group = group;
    this.content = content;
    this.start = start;
    this.end = end;
    this.editable = editable;
  }
}