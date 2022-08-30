import StateMachine from "../src/StateMachine";
import { StateMachineError, StateMachineErrorCode } from "../src/StateMachineError";
import { IObject, IState, ITransition } from "../src/types";

enum STATES {
	SOLID = "SOLID",
	LIQUID = "LIQUID",
	GAS = "GAS",
	PLASMA = "PLASMA",
}

enum TRANSITIONS {
	MELT = "MELT",
	VAPORIZE = "VAPORIZE",
	CONDENSE = "CONDENSE",
	FREEZE = "FREEZE",
	SUBLIMATION = "SUBLIMATION",
	DESUBLIMATION = "DESUBLIMATION",
	RECOMBINATION = "RECOMBINATION",
	IONIZATION = "IONIZATION",
}

type temperature = number;

let TestSM: StateMachine<STATES, TRANSITIONS, temperature>;
let transitions: ITransition<STATES, TRANSITIONS, temperature>[];
let states: IState<STATES, TRANSITIONS, temperature>[];
// TODO: fix try catch with finally
describe("State Machine: Throws", () => {
	beforeEach(() => {
		transitions = [
			{
				name: TRANSITIONS.MELT,
				from: STATES.SOLID,
				to: STATES.LIQUID,
			},
			{
				name: TRANSITIONS.FREEZE,
				from: STATES.LIQUID,
				to: STATES.SOLID,
			},
			{
				name: TRANSITIONS.VAPORIZE,
				from: STATES.LIQUID,
				to: STATES.GAS,
			},
			{
				name: TRANSITIONS.CONDENSE,
				from: STATES.GAS,
				to: STATES.LIQUID,
				before: [
					() => {
						return new Promise(resolve => {
							setTimeout(() => resolve(true), 5);
						});
					},
				],
			},
		];

		states = [
			{
				name: STATES.SOLID,
				data: -100,
			},
			{
				name: STATES.LIQUID,
				data: 50,
			},
			{
				name: STATES.GAS,
				data: 200,
			},
		];
		const increaseEntropy = ({ transport }: { transport: IObject }) => {
			transport["entropy"] =
				transport["entropy"] === undefined ? 0 : transport["entropy"] + 1;
		};

		TestSM = new StateMachine<STATES, TRANSITIONS, temperature>(
			STATES.SOLID,
			states,
			{
				transitions,
				after: increaseEntropy,
			},
			{
				onError(error) {
					if (error.code === StateMachineErrorCode.TIMEOUT) {
						console.log(error.code);
						// throw Error("123");
					}
				},
				timeout: 10000,
			}
		);
	});

	it(`too long Promise resolving throw StateMachineError#TIMEOUT`, async () => {
		TestSM.onBeforeTransition(function() {
			return new Promise(resolve => {
				setTimeout(() => resolve(true), 2000);
			});
		});
		let error;

		try {
			await TestSM.transitTo(STATES.LIQUID);
		} catch (throwedError) {
			error = throwedError;
		} finally {
			expect(error).toBeInstanceOf(StateMachineError);
			expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.TIMEOUT);
		}
	});

	describe(`"onError" custom error handling`, () => {
		it(`if "onError" not throw custom error, then standard error will throwed on setup stage`, () => {
			let onErrorWasFired = false;
			let error;

			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.PLASMA, // ABSENT_STATE
					[],
					[],
					{
						onError() {
							onErrorWasFired = true;
						},
					}
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.ABSENT_STATE);
			}

			expect(onErrorWasFired).toEqual(true);
		});

		it(`"onError" throw custom error on setup stage`, () => {
			class CustomError extends Error {
				public constructor(message: string, public standardError: Error) {
					super(message);

					// Set the prototype explicitly.
					Object.setPrototypeOf(this, CustomError.prototype);
				}
			}

			let error;

			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.PLASMA, // ABSENT_STATE
					[],
					[],
					{
						onError(error) {
							throw new CustomError("Custom Error!", error);
						},
					}
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(CustomError);
				expect(error.standardError).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty(
					["standardError", "code"],
					StateMachineError.ERROR_CODE.ABSENT_STATE
				);
			}
		});
	});

	describe(`"constructor" throw StateMachineError`, () => {
		it(`"constructor" throw StateMachineError#ABSENT_STATE`, () => {
			let error;

			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.PLASMA, // ABSENT_STATE
					{ states: [] },
					{ transitions: [] }
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.ABSENT_STATE);
			}
		});

		it(`"constructor" throw StateMachineError#DUPLICATED_STATE`, () => {
			let error;

			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.SOLID,
					{
						states: [
							{ name: STATES.SOLID, data: {} },
							{ name: STATES.SOLID, data: {} },
						],
					},
					{ transitions: [] }
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.DUPLICATED_STATE);
			}
		});

		it(`"constructor" throw StateMachineError#DUPLICATED_TRANSITION`, () => {
			let error;
			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.SOLID,
					{
						states: [
							{ name: STATES.SOLID, data: {} },
							{ name: STATES.LIQUID, data: {} },
						],
					},
					{
						transitions: [
							{
								name: TRANSITIONS.MELT, // DUPLICATED_TRANSITION
								from: STATES.SOLID,
								to: STATES.LIQUID,
							},
							{
								name: TRANSITIONS.MELT, // DUPLICATED_TRANSITION
								from: STATES.SOLID,
								to: STATES.LIQUID,
							},
						],
					}
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty(
					"code",
					StateMachineError.ERROR_CODE.DUPLICATED_TRANSITION
				);
			}
		});

		it(`"constructor" throw StateMachineError#ABSENT_STATE (to)`, () => {
			let error;
			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.SOLID,
					{
						states: [
							{ name: STATES.SOLID, data: {} },
							{ name: STATES.LIQUID, data: {} },
						],
					},
					{
						transitions: [
							{
								name: TRANSITIONS.MELT,
								from: STATES.SOLID,
								to: STATES.GAS, // ABSENT_STATE to
							},
						],
					}
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.ABSENT_STATE);
			}
		});

		it(`"constructor" throw StateMachineError#ABSENT_STATE (from)`, () => {
			let error;
			try {
				// tslint:disable-next-line:no-unused-expression
				new StateMachine(
					STATES.SOLID,
					{
						states: [
							{ name: STATES.SOLID, data: {} },
							{ name: STATES.LIQUID, data: {} },
						],
					},
					{
						transitions: [
							{
								name: TRANSITIONS.MELT,
								from: STATES.GAS, // ABSENT_STATE from
								to: STATES.LIQUID,
							},
						],
					}
				);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.ABSENT_STATE);
			}
		});
	});

	describe(`"doTransition" throw StateMachineError`, () => {
		it(`"doTransition" throw StateMachineError#${
			StateMachineError.ERROR_CODE.PENDING_STATE
		}`, async () => {
			let error;

			await TestSM.doTransition(TRANSITIONS.MELT);
			expect(TestSM.isPending).toBe(false);
			TestSM.doTransition(TRANSITIONS.VAPORIZE);
			expect(TestSM.isPending).toBe(true);

			try {
				await TestSM.doTransition(TRANSITIONS.MELT);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.PENDING_STATE);
			}
		});

		it(`"doTransition" return ITansitionResult with  StateMachineError#${
			StateMachineError.ERROR_CODE.ABSENT_TRANSITION
		} and not throw error`, async () => {
			let error;
			try {
				let transitionResult = await TestSM.doTransition(TRANSITIONS.SUBLIMATION);

				expect(transitionResult.isSuccess).toBe(false);

				if(transitionResult.isSuccess === false) {
					expect(transitionResult.error).toBeInstanceOf(StateMachineError);
					expect(transitionResult.error).toHaveProperty(
						"code",
						StateMachineError.ERROR_CODE.ABSENT_TRANSITION
					);
				}
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeUndefined();
			}
		});

		it(`"doTransition" return ITansitionResult with StateMachineError#${
			StateMachineError.ERROR_CODE.UNAVAILABLE_TRANSITION
		} and not throw error`, async () => {
			let error;
			try {
				let transitionResult = await TestSM.doTransition(TRANSITIONS.VAPORIZE);

				expect(transitionResult.isSuccess).toBe(false);

				if(transitionResult.isSuccess === false) {
					expect(transitionResult.error).toBeInstanceOf(StateMachineError);
					expect(transitionResult.error).toHaveProperty(
						"code",
						StateMachineError.ERROR_CODE.UNAVAILABLE_TRANSITION
					);
				}
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeUndefined();
			}
		});
	});

	describe(`"transitTo" throw StateMachineError`, () => {
		it(`"transitTo" throw StateMachineError#${
			StateMachineError.ERROR_CODE.PENDING_STATE
		}`, async () => {
			let error;
			await TestSM.transitTo(STATES.LIQUID);
			expect(TestSM.isPending).toBe(false);
			TestSM.transitTo(STATES.GAS);
			expect(TestSM.isPending).toBe(true);

			try {
				await TestSM.transitTo(STATES.LIQUID);
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeInstanceOf(StateMachineError);
				expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.PENDING_STATE);
			}
		});

		it(`"transitTo" return ITansitionResult with StateMachineError#${
			StateMachineError.ERROR_CODE.ABSENT_STATE
		} and not throw error`, async () => {
			let error;
			try {
				let transitionResult = await TestSM.transitTo(STATES.PLASMA);

				expect(transitionResult.isSuccess).toBe(false);

				if(transitionResult.isSuccess === false) {
					expect(transitionResult.error).toBeInstanceOf(StateMachineError);
					expect(transitionResult.error).toHaveProperty(
						"code",
						StateMachineError.ERROR_CODE.ABSENT_STATE
					);
				}
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeUndefined();
			}
		});

		it(`"transitTo" return ITansitionResult with StateMachineError#${
			StateMachineError.ERROR_CODE.UNAVAILABLE_STATE
		} and not throw error`, async () => {
			let error;
			try {
				let transitionResult = await TestSM.transitTo(STATES.SOLID);

				expect(transitionResult.isSuccess).toBe(false);

				if(transitionResult.isSuccess === false) {
					expect(transitionResult.error).toBeInstanceOf(StateMachineError);
					expect(transitionResult.error).toHaveProperty(
						"code",
						StateMachineError.ERROR_CODE.UNAVAILABLE_STATE
					);
				}
			} catch (throwedError) {
				error = throwedError;
			} finally {
				expect(error).toBeUndefined();
			}
		});
	});

	it(`"is" throw StateMachineError#PENDING_STATE`, async () => {
		let error;
		const testPromise = new Promise<STATES>(resolve => {
			setTimeout(() => {
				resolve(STATES.LIQUID);
			}, 0);
		});
		await TestSM.is(testPromise);
		TestSM.is(() => STATES.LIQUID);
		TestSM.is(STATES.LIQUID);
		expect(TestSM.isPending).toBe(false);
		TestSM.is(testPromise);
		expect(TestSM.isPending).toBe(true);

		try {
			await TestSM.is(Promise.resolve(STATES.SOLID));
		} catch (throwedError) {
			error = throwedError;
		} finally {
			expect(error).toBeInstanceOf(StateMachineError);
			expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.PENDING_STATE);
		}
	});

	it(`"canTransitTo" throw StateMachineError#PENDING_STATE`, async () => {
		let error;
		const testPromise = new Promise<STATES>(resolve => {
			setTimeout(() => {
				resolve(STATES.LIQUID);
			}, 0);
		});
		await TestSM.canTransitTo(testPromise);
		TestSM.canTransitTo(() => STATES.LIQUID);
		TestSM.canTransitTo(STATES.LIQUID);
		expect(TestSM.isPending).toBe(false);
		TestSM.canTransitTo(testPromise);
		expect(TestSM.isPending).toBe(true);

		try {
			await TestSM.canTransitTo(Promise.resolve(STATES.SOLID));
		} catch (throwedError) {
			error = throwedError;
		} finally {
			expect(error).toBeInstanceOf(StateMachineError);
			expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.PENDING_STATE);
		}
	});

	it(`"canDoTransition" throw StateMachineError#PENDING_STATE`, async () => {
		let error;
		const testPromise = new Promise<TRANSITIONS>(resolve => {
			setTimeout(() => {
				resolve(TRANSITIONS.CONDENSE);
			}, 0);
		});
		await TestSM.canDoTransition(testPromise);
		TestSM.canDoTransition(() => TRANSITIONS.CONDENSE);
		TestSM.canDoTransition(TRANSITIONS.CONDENSE);
		expect(TestSM.isPending).toBe(false);
		TestSM.canDoTransition(testPromise);
		expect(TestSM.isPending).toBe(true);

		try {
			await TestSM.canDoTransition(Promise.resolve(TRANSITIONS.CONDENSE));
		} catch (throwedError) {
			error = throwedError;
		} finally {
			expect(error).toBeInstanceOf(StateMachineError);
			expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.PENDING_STATE);
		}
	});

	it(`"hydrate" throw StateMachineError#ABSENT_STATE`, async () => {
		let error;
		let dehydratedState = TestSM.dehydrated;
		expect(dehydratedState).toEqual({
			state: STATES.SOLID,
			data: -100,
			transport: {},
		});
		await TestSM.transitTo(STATES.LIQUID);
		await TestSM.transitTo(STATES.GAS);
		expect(TestSM.dehydrated).toEqual({
			state: STATES.GAS,
			data: 200,
			transport: {
				entropy: 1,
			},
		});

		try {
			TestSM.hydrate({
				state: STATES.PLASMA,
				data: -100,
				transport: {},
			});
		} catch (throwedError) {
			error = throwedError;
		} finally {
			expect(error).toBeInstanceOf(StateMachineError);
			expect(error).toHaveProperty("code", StateMachineError.ERROR_CODE.ABSENT_STATE);
		}
	});
});
