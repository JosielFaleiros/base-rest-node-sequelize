import Bull from 'bull';
import {injectable} from "inversify";

/**
 * https://optimalbits.github.io/bull/
 */
@injectable()
export class QueueProvider {
    existing = {}
    public getQueue(name: string) {
        if (this.existing[name]) return this.existing[name]
        return new Bull(name, {
            redis: {
                host: 'redis',
                port: 6379
            }
        });
    }
    public static newQueue(name: string) {
        return new Bull(name, {
            redis: {
                host: 'redis',
                port: 6379
            }
        });
    }
}