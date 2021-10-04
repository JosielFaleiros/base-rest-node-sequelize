export const Exception = (): MethodDecorator => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod = descriptor.value;
        //wrapping the original method
        descriptor.value = async function (req, res) {
            try {
                await originalMethod.apply(this, arguments);
            } catch (e) {
                console.log(e);
                console.log('Exception in decorator');
                res.status(500).send('Internal server error')
            }
        }
    }
}
