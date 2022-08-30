import { RequestMethod } from "./Controller";
import { RequestMethodDecoratorFactory } from "./HttpMethod";

export const Get = RequestMethodDecoratorFactory(RequestMethod.GET);
