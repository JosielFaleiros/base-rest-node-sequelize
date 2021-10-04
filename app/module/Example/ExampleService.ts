import CommonService from '../../shared/CommonService'
import {inject, injectable} from "inversify";
import {QueueProvider} from "../../shared/provider/Queue.provider";
import TYPES from "../../types/types";
import {Transaction} from "../../shared/decorator/Transaction";
import {QueueJobStatus} from "../../shared/dto/QueueJob";

@injectable()
export default class ExampleService extends CommonService {
  public queueProvider: QueueProvider;
  constructor(
      @inject(TYPES.QueueProvider) queueProvider: QueueProvider
  ) {
    super('Example')
    this.queueProvider = queueProvider;
    console.log('this.repository ',this.repository);
    // this.listenToErpSegIntegration();
    this.repository.addHook('afterUpdate', async (object, options ={}) => {
      console.log(' afterUpdate hook 2 2 ');
      await new Promise((resolve, reject) => {
        setTimeout(() =>
                this.afterUpdateHook(resolve),
            0
        )
      })
    })
    this.repository.addHook('afterCreate', async (object, options ={}) => {
      console.log(' afterCreate hook ', object);
      await new Promise((resolve, reject) => {
        setTimeout(() =>
                this.afterUpdateHook(resolve),
            0
        )
      })
    })
  }

  @Transaction()
  update(object, options: { where?: { id?: number } }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const res = await super.update(object, options);
      console.log(' after update call ')
      setTimeout(async () => {
        console.log('rb in update');
        resolve(res);
      }, 0)
    })
  }

  afterUpdateHook(resolve: Function) {
    console.log(' after update hook timeout finish ');
    resolve()
  }

  listenToErpSegIntegration() {
    const que = this.queueProvider.getQueue('asdf3');
    que.process(async job => {
      console.log('process job 222 ', job.id, job.data);
      return await this.update(job.data, {})
    });
    // que.add({id: 1, name: '33333333333333333333333333333333333333'})
    que.on(QueueJobStatus.COMPLETED, (job, result) => {
      console.log(`Job completed with result 23432 ${result}`);
    })
  }
}
