import StateMachine from "../src/StateMachine";
import { IObject, IState, ITransition } from "../src/types";
import { StateMachineError } from "../src/StateMachineError";

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

describe("State Machine", () => {
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
					if (error.code === "TIMEOUT") {
						console.log(error.code);
						// throw Error("123");
					}
				},
				timeout: 10000,
			},
		);
	});

	it(`should exist`, () => {
		expect(TestSM).toBeDefined();
	});

	it(`should be initialized with right state`, () => {
		expect(TestSM.state).toBe(STATES.SOLID);
	});

	it(`should pass "is" predicate`, async () => {
		expect(await TestSM.is(Promise.resolve(STATES.SOLID))).toBe(true);
		expect(TestSM.is(STATES.SOLID)).toBe(true);
		expect(TestSM.is(() => STATES.SOLID)).toBe(true);
	});

	it(`should not pass "is" predicate`, async () => {
		expect(await TestSM.is(STATES.LIQUID)).toBe(false);
		expect(await TestSM.is(() => STATES.LIQUID)).toBe(false);
	});

	it("should pass 'canTransitTo' predicate", async () => {
		expect(TestSM.canTransitTo(STATES.LIQUID)).toBe(true);
		expect(TestSM.canTransitTo(() => STATES.LIQUID)).toBe(true);
		expect(await TestSM.canTransitTo(Promise.resolve(STATES.LIQUID))).toBe(true);
	});

	it("should not pass 'canTransitTo' predicate", async () => {
		expect(TestSM.canTransitTo(STATES.GAS)).toBe(false);
		expect(TestSM.canTransitTo(() => STATES.GAS)).toBe(false);
		expect(await TestSM.canTransitTo(Promise.resolve(STATES.GAS))).toBe(false);
	});

	it("should pass 'canDoTransition' predicate", async () => {
		expect(TestSM.canDoTransition(TRANSITIONS.MELT)).toBe(true);
		expect(TestSM.canDoTransition(() => TRANSITIONS.MELT)).toBe(true);
		expect(await TestSM.canDoTransition(Promise.resolve(TRANSITIONS.MELT))).toBe(true);
	});

	it("should not pass 'canDoTransition' predicate", async () => {
		expect(TestSM.canDoTransition(TRANSITIONS.CONDENSE)).toBe(false);
		expect(TestSM.canDoTransition(() => TRANSITIONS.CONDENSE)).toBe(false);
		expect(await TestSM.canDoTransition(Promise.resolve(TRANSITIONS.CONDENSE))).toBe(false);
	});

	it(`should transit to ${STATES.LIQUID}`, async () => {
		const transitionResult = await TestSM.transitTo(STATES.LIQUID);

		expect(transitionResult.isSuccess).toBe(true);

		if (transitionResult.isSuccess) {
			expect(TestSM.state).toBe(STATES.LIQUID);
		}
	});

	it(`should transit to () => ${STATES.LIQUID}`, async () => {
		const transitionResult = await TestSM.transitTo(() => STATES.LIQUID);

		expect(transitionResult.isSuccess).toBe(true);

		if (transitionResult.isSuccess) {
			expect(TestSM.state).toBe(STATES.LIQUID);
		}
	});

	it("should return right state after several transitions", async () => {
		const firstTransitionResult = await TestSM.transitTo(STATES.LIQUID);

		expect(firstTransitionResult.isSuccess).toBe(true);

		if (firstTransitionResult.isSuccess) {
			expect(TestSM.state).toBe(STATES.LIQUID);
		}

		const secondTransitionResult = await TestSM.transitTo(STATES.GAS);

		expect(secondTransitionResult.isSuccess).toBe(true);

		if (secondTransitionResult.isSuccess) {
			expect(TestSM.state).toBe(STATES.GAS);
		}
	});

	it("should return all possible states", () => {
		expect(TestSM.allStates).toEqual(states.map(state => state.name));
	});

	it("should return all possible transitions", () => {
		expect(TestSM.allTransitions).toEqual(transitions.map(transition => transition.name));
	});

	it("should return list of transitions that are allowed from the current state", () => {
		expect(TestSM.transitions).toEqual([transitions[0].name]);
	});

	it("should return right pending state", async () => {
		await TestSM.transitTo(STATES.LIQUID);
		expect(TestSM.isPending).toBe(false);
	});

	it("should return right pending state", async () => {
		await TestSM.transitTo(STATES.LIQUID);
		expect(TestSM.isPending).toBe(false);
		TestSM.transitTo(STATES.GAS);
		expect(TestSM.isPending).toBe(true);
	});

	it("check transport state", async () => {
		await TestSM.transitTo(STATES.LIQUID);
		expect(TestSM.transport.entropy).toBe(0);
		await TestSM.transitTo(STATES.GAS);
		expect(TestSM.transport.entropy).toBe(1);
		await TestSM.transitTo(STATES.LIQUID);
		expect(TestSM.transport.entropy).toBe(2);
		await TestSM.transitTo(STATES.SOLID);
		expect(TestSM.transport.entropy).toBe(3);
		await TestSM.transitTo(STATES.LIQUID);
		expect(TestSM.transport.entropy).toBe(4);
	});

	it(`check "transitTo" return ITransitionResult`, async () => {
		const transitionResult = await TestSM.transitTo(STATES.LIQUID);

		expect(transitionResult).toHaveProperty("isSuccess");
		expect(transitionResult).not.toHaveProperty("error");
	});

	it(`check "transitTo" return right ITransitionResult`, async () => {
		const transitionResult = await TestSM.transitTo(STATES.LIQUID);

		expect(transitionResult.isSuccess).toBe(true);
	});

	it(`check "transitTo" return wrong ITransitionResult`, async () => {
		const transitionResult = await TestSM.transitTo(STATES.GAS);

		expect(transitionResult.isSuccess).toBe(false);

		if(transitionResult.isSuccess === false) {
			expect(transitionResult.error).toBeInstanceOf(StateMachineError);
		}
	});

	it(`check "doTransition" return ITransitionResult`, async () => {
		const transitionResult = await TestSM.doTransition(TRANSITIONS.MELT);

		expect(transitionResult).toHaveProperty("isSuccess");
		expect(transitionResult).not.toHaveProperty("error");
	});

	it(`check "doTransition" return right ITransitionResult`, async () => {
		const transitionResult = await TestSM.doTransition(TRANSITIONS.MELT);

		expect(transitionResult.isSuccess).toBe(true);
	});

	it(`check "doTransition" return wrong ITransitionResult`, async () => {
		const transitionResult = await TestSM.doTransition(TRANSITIONS.VAPORIZE);

		expect(transitionResult.isSuccess).toBe(false);
		if(transitionResult.isSuccess === false) {
			expect(transitionResult.error).toBeInstanceOf(StateMachineError);
		}
	});

	it(`check "transitTo" passed arguments`, async () => {
		let passedArgs!: number[];
		TestSM.onBeforeTransition((_lifecycle: any, ...args: number[]) => {
			passedArgs = args;
		});
		await TestSM.transitTo(STATES.LIQUID, 1, 2, 3);
		expect(passedArgs).toEqual([1, 2, 3]);
	});

	it(`check "doTransition" passed arguments`, async () => {
		let passedArgs!: number[];
		TestSM.onBeforeTransition((_lifecycle: any, ...args: number[]) => {
			passedArgs = args;
		});
		await TestSM.doTransition(TRANSITIONS.MELT, 1, 2, 3);
		expect(passedArgs).toEqual([1, 2, 3]);
	});

	it("check dehydration", async () => {
		expect(TestSM.dehydrated).toEqual({
			state: STATES.SOLID,
			data: -100,
			transport: {},
		});
		await TestSM.transitTo(STATES.LIQUID);
		expect(TestSM.dehydrated).toEqual({
			state: STATES.LIQUID,
			data: 50,
			transport: {
				entropy: 0,
			},
		});
		await TestSM.transitTo(STATES.GAS);
		expect(TestSM.dehydrated).toEqual({
			state: STATES.GAS,
			data: 200,
			transport: {
				entropy: 1,
			},
		});
	});

	it("check dehydration immutability", async () => {
		expect(TestSM.dehydrated).not.toBe(TestSM.dehydrated);
	});

	it("check hydration", async () => {
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
		TestSM.hydrate(dehydratedState);
		expect(TestSM.dehydrated).toEqual({
			state: STATES.SOLID,
			data: -100,
			transport: {},
		});
	});

	it("check toJSON interface implementation", async () => {
		expect(JSON.stringify(TestSM)).toEqual(JSON.stringify({
			state: STATES.SOLID,
			data: -100,
			transport: {},
		}));
		await TestSM.transitTo(STATES.LIQUID);
		await TestSM.transitTo(STATES.GAS);
		expect(JSON.stringify(TestSM)).toEqual(JSON.stringify({
			state: STATES.GAS,
			data: 200,
			transport: {
				entropy: 1,
			},
		}));
	});

	it("check toString interface implementation", async () => {
		expect(String(TestSM))
			.toEqual("StateMachine(SOLID){\"state\":\"SOLID\",\"data\":-100,\"transport\":{}}");
		await TestSM.transitTo(STATES.LIQUID);
		await TestSM.transitTo(STATES.GAS);
		expect(String(TestSM))
			.toEqual("StateMachine(GAS){\"state\":\"GAS\",\"data\":200,\"transport\":{\"entropy\":1}}");
	});

});
