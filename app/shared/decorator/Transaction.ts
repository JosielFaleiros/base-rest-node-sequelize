export const Transaction = (): MethodDecorator => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod = descriptor.value;
        //wrapping the original method
        descriptor.value = async function (object, options) {
            try {
                return await this.sequelize.transaction(async transaction => {
                    console.log("wrapped function: before invoking " + propertyKey);
                    let result = await originalMethod.apply(this, [object, {...options, transaction}]);
                    console.log("wrapped function: after invoking " + propertyKey);
                    return result;
                });
            } catch (e) {
                console.log(e);
                console.log('rb in decorator');
                throw new Error('Transaction error');
            }
        }
    }
}
