import express from 'express';
import ExampleController from "./app/module/Example/ExampleController";
import {DIContainer} from "./inversify.config";
import {ControllerType} from "./app/shared/dto/ControllerType";
import {RouteDefinition} from "./app/shared/dto/RouteDefinition";
import cors from 'cors';
import morgan from 'morgan';
import AnotherController from "./app/module/Another/AnotherController";

class App {
    public express: any;

    constructor() {
        console.log('App.constructor() ');
        this.express = express();
        this.setupExpress();
        this.loadRoutes();
        this.express.listen(3000, () => {
            console.log('Started server on port 3000');
        })
    }

    setupExpress() {
        this.express.use(express.json())
        this.express.use(cors())
        this.express.use(morgan('short'))
    }

    private loadRoutes() {
        console.log('App.loadRoutes() ');
        [
            ExampleController,
            AnotherController
        ].forEach(controller => {
            // This is our instantiated class
            const instance = DIContainer.resolve<ControllerType>(controller);
            // The prefix saved to our controller
            const prefix = Reflect.getMetadata('prefix', controller);
            // Our `routes` array containing all our routes for this controller
            const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller);

            // Iterate over all routes and register them to our express application
            routes.forEach(route => {
                // It would be a good idea at this point substitute the `app[route.requestMethod]` with a `switch/case` statement
                // since we can't be sure about the availability of methods on our `app` object. But for the sake of simplicity
                // this should be enough for now.
                this.express[route.requestMethod](prefix + route.path, (req: express.Request, res: express.Response) => {
                    // Execute our method for this path and pass our express request and response object.
                    instance[route.methodName](req, res);
                });
            });
        });
        this.express.use('/', (req, res) => {
            console.log(.1 + .2);
            res.json({
                message: 'hello world'
            });
        })
    }
}
export default new App().express;