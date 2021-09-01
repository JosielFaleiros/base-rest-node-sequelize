import 'reflect-metadata';
import TYPES from './app/types/types';

import {Container} from 'inversify';
import ExampleService from "./app/services/ExampleService";

const DIContainer = new Container({skipBaseClassChecks: true});

DIContainer.bind<ExampleService>(TYPES.ExampleService ).to(ExampleService).inSingletonScope();
export {DIContainer};