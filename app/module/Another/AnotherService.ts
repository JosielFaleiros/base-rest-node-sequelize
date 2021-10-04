import CommonService from '../../shared/CommonService'
import {inject, injectable} from "inversify";
import {QueueProvider} from "../../shared/provider/Queue.provider";
import TYPES from "../../types/types";
import {Transaction} from "../../shared/decorator/Transaction";
import {QueueJobStatus} from "../../shared/dto/QueueJob";
import {ProcessIntegrationErpSeg} from "../../shared/decorator/ProcessIntegrationErpSeg";

@injectable()
export default class AnotherService extends CommonService {
  public queueProvider: QueueProvider;
  constructor(
      @inject(TYPES.QueueProvider) queueProvider: QueueProvider
  ) {
    super('Another')
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
      return super.update(object, options);
  }

  afterUpdateHook(resolve: Function) {
    console.log(' after update hook timeout finish ');
    resolve()
  }

  @ProcessIntegrationErpSeg()
  async ProcessIntegrationErpSeg(job) {
    console.log('process job 222 ', job.id, job.data);
    return this.update(job.data, {})
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
