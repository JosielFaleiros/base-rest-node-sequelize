import {QueueProvider} from "../provider/Queue.provider";

export const ProcessIntegrationErpSeg = (): MethodDecorator => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod = descriptor.value;
        console.log('process integration erp seg ');
        const que = QueueProvider.newQueue('asdf3');
        que.process(async job => await originalMethod(job))

        // //wrapping the original method
        // descriptor.value = async function () {
        //     console.log(' descriptor value fn ');
        // }
    }
}
