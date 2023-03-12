export class TimeLine {
    constructor() {
        this.data = [];
        this.yGroupDomain = [];
        this.margin = { top: 30, bottom: 30, left: 30, right: 30 };
        this.width = 1000;
        this.height = 500;
        let now = moment();
        this.xTimeDomain = [now.add(-5, 'days').toDate(), now.add(45, 'days').toDate()];
    }
}
