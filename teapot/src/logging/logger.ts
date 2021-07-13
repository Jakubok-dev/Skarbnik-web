import { LoggingManager } from "./loggingManager";

enum Priority {
    DEBUG,
    INFO,
    WARNING,
    SERVERE,
    FATAL
}

export class Logger {
    private _name :string;
    get name() {
        return this._name;
    }
    private _manager ?:LoggingManager;
    get loggingManager() {
        return this._manager;
    }

    constructor(name :string, manager ?:LoggingManager) {
        this._name = name;
        this._manager = manager;
    }

    log(message :any, priority :Priority = 1) {
        let date = new Date();
        date.getTime();

        const dateFormat :string = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        const nameFormat = `[${this._name}]`;
        const priorityFormat = `(${Priority[priority]})`;
        const logMessage = `${dateFormat} ${nameFormat} ${priorityFormat} >> ${message instanceof Object ? JSON.stringify(message, null, 2) : message}`;

        if (priority === Priority.DEBUG)
            console.log(logMessage);
        else if (priority === Priority.INFO)
            console.info(logMessage);
        else if (priority === Priority.WARNING)
            console.warn(logMessage);
        else if (priority === Priority.SERVERE)
            console.warn(logMessage);
        else if (priority === Priority.FATAL)
            console.error(logMessage);

        if (this._manager)
            this._manager.trigger(logMessage);
    }
}

export const fromLogger = (logger :Logger, name :string):Logger => {
    return new Logger(logger.name + "/" + name, logger.loggingManager);
}