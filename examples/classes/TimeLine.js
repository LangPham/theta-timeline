"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeLine = void 0;
const moment_1 = __importDefault(require("moment"));
class TimeLine {
    constructor() {
        this.data = [];
        this.yGroupDomain = [];
        this.margin = { top: 30, bottom: 30, left: 30, right: 30 };
        this.width = 1000;
        this.height = 500;
        let now = (0, moment_1.default)();
        this.xTimeDomain = [now.add(-5, 'days').toDate(), now.add(45, 'days').toDate()];
    }
}
exports.TimeLine = TimeLine;
