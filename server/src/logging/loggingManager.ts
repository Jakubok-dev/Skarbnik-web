import { appendFileSync, existsSync, mkdirSync } from "fs";

export class LoggingManager {

    directory = `./logs`;
    filename :string;

    constructor() {
        if (!existsSync(this.directory))
            mkdirSync(this.directory);

        const now = new Date(Date.now());

        // egzample: 21_37_69___6_7_2021.txt
        this.filename = `${this.directory}/${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}_${now.getMilliseconds()}___${now.getDay()}_${now.getMonth()}_${now.getFullYear()}.txt`;

        appendFileSync(this.filename, `Logging manager is now registering logs`);
    }

    trigger(message :string) {
        if (!existsSync(this.directory))
            mkdirSync(this.directory);
        
        appendFileSync(this.filename, `\n${message}`);
    }
}