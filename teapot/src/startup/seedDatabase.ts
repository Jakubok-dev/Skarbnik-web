import { Account } from "../entity/Account";
import { applogger, database } from "../app"
import { fromLogger } from "../logging/logger"
import { PermissionsManager } from "../entity/PermissionsManager";
import { ROOT } from "../permissions/Root";
import bcrypt from "bcryptjs";

export const seedDatabase = async () => {
    const logger = fromLogger(applogger, `seedDatabase`);

    if ((await database.getRepository(Account).find()).length === 0) {

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(`foobar`, salt);

        const root = Account.create({
            username: `root`,
            password: hash,
            permissionsManager: new PermissionsManager()
        });
        root.permissionsManager.account = root.toPromise();
        root.permissionsManager.permissionGroup = ROOT;

        await root.save();
        logger.log(`Seeded the "Account" table with the root account`);
    }
}