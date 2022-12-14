import StateMachine from "./StateMachine";
import { StateMachineError } from "./StateMachineError";

export type Arrayable<T> = T | T[];
export type Callable<T> = T | (() => T);
export type Thenable<T> = T | PromiseLike<T>;
export type Source<T> = T | (() => T) | PromiseLike<T>;

export interface IState<S = string | symbol, T = string | symbol, D = any> {
	name: S;
	data: D;
	before?: Arrayable<ICancelableHook<S, T, D>>;
	after?: Arrayable<ICancelableHook<S, T, D>>;
}

export interface ITransition<S = string | symbol, T = string | symbol, D = any> {
	name: T;
	from: IState<S, T, D>["name"];
	to: IState<S, T, D>["name"];
	before?: Arrayable<ICancelableHook<S, T, D>>;
	after?: Arrayable<ICancelableHook<S, T, D>>;
}

// tslint:disable-next-line:class-name
export interface _ITransition<S, T, D> extends ITransition<S, T, D> {
	before: ICancelableHook<S, T, D>[];
	after: ICancelableHook<S, T, D>[];
}

// tslint:disable-next-line:class-name
export interface _IState<S, T, D> extends IState<S, T, D> {
	before: ICancelableHook<S, T, D>[];
	after: ICancelableHook<S, T, D>[];
}

export interface IConfig {
	onError?: (error: StateMachineError) => void | never;
	timeout?: number;
}

export interface ILyfecycle<S, T, D> {
	transport: IObject;
	transition: _ITransition<S, T, D>;
	from: _IState<S, T, D>;
	to: _IState<S, T, D>;
}

export type ICancelableHook<S, T, D> = (
	this: StateMachine<S, T, D>,
	lifecycle: ILyfecycle<S, T, D>,
	...args: any[]
) => ICancelableHookResult;

export type ICancelableHookResult = Thenable<never | void | false>;
export type IObject = {
	[key: string]: any;
	[key: number]: any;
	// [key: symbol]: any;
};

export interface IHydratedState<S, D> {
	state: S;
	data: D;
	transport: IObject;
}

export interface IStateMachineSuccessfulTransitionResult { isSuccess: true }
export interface IStateMachineErrorTransitionResult  { isSuccess: false; error: StateMachineError }
export type IStateMachineTransitionResult =
	IStateMachineErrorTransitionResult
	| IStateMachineSuccessfulTransitionResult;
