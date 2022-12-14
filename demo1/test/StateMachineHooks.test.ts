import StateMachine from "../src/StateMachine";
import { IState, ITransition } from "../src/types";

describe("State Machine Hooks", () => {
	// tslint:disable-next-line:no-empty
	const noop = () => {
	};

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
	}

	type temperature = number;

	let TestSM: StateMachine<STATES, TRANSITIONS, { temperature: temperature }>;
	let transitions: ITransition<STATES, TRANSITIONS, { temperature: temperature }>[];
	let states: IState<STATES, TRANSITIONS, { temperature: temperature }>[];

	beforeEach(() => {
		transitions = [
			{
				name: TRANSITIONS.MELT,
				from: STATES.SOLID,
				to: STATES.LIQUID,
				after: [
					// log("before Melting")
				],
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
							setTimeout(() => resolve(true), 0);
						});
					},
				],
			},
		];

		states = [
			{
				name: STATES.SOLID,
				data: { temperature: -100 },
			},
			{
				name: STATES.LIQUID,
				data: { temperature: 50 },
			},
			{
				name: STATES.GAS,
				data: { temperature: 200 },
			},
		];

		TestSM = new StateMachine<STATES, TRANSITIONS, { temperature: temperature }>(
			STATES.SOLID,
			{
				states,
			},
			{
				transitions,
			},
		);
	});

	describe("BET: beforeEachTransitionHook: () => T", () => {
		it("should add beforeEachTransitionHook", done => {
			TestSM.onBeforeTransition(() => {
				done();
			});
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should add several beforeEachTransitionHooks", done => {
			TestSM.onBeforeTransition([
				noop,
				() => true,
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from beforeEachTransitionHook", async () => {
			TestSM.onBeforeTransition([noop, () => true, () => false]);
			const transitionResult = await TestSM.transitTo(STATES.LIQUID);

			expect(transitionResult.isSuccess).toBe(true);

			if (transitionResult.isSuccess) {
				expect(TestSM.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("BET:P beforeEachTransitionHook: () => PromiseLike<T>", () => {
		it("should add PromiseLike beforeEachTransitionHook", done => {
			TestSM.onBeforeTransition([
				() => true,
				() => Promise.resolve(true),
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should add several PromiseLike beforeEachTransitionHooks", done => {
			TestSM.onBeforeTransition([
				() => Promise.resolve(),
				() => Promise.resolve(true),
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from PromiseLike beforeEachTransitionHook", async () => {
			TestSM.onBeforeTransition([
				() => Promise.resolve(),
				() => Promise.resolve(true),
				() => Promise.resolve(false),
			]);

			const transitionResult = await TestSM.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(TestSM.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("AET: afterEachTransitionHook: () => T", () => {
		it("should add afterEachTransition", done => {
			TestSM.onAfterTransition(() => {
				done();
			});
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should add several afterEachTransition", done => {
			TestSM.onAfterTransition([
				noop,
				() => true,
				async () => Promise.resolve(true),
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from afterEachTransition", async () => {
			TestSM.onAfterTransition(() => false);

			const transitionResult = await TestSM.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(TestSM.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("AET:P afterEachTransitionHook: () => PromiseLike<T>", () => {
		it("should add PromiseLike afterEachTransition", done => {
			TestSM.onAfterTransition([
				() => Promise.resolve(),
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should add several PromiseLike afterEachTransition", done => {
			TestSM.onAfterTransition([
				() => Promise.resolve(),
				() => Promise.resolve(true),
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from PromiseLike afterEachTransitionHook", async () => {
			TestSM.onAfterTransition([
				() => Promise.resolve(),
				() => Promise.resolve(true),
				() => Promise.resolve(false),
			]);

			const transitionResult = await TestSM.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(TestSM.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("BES: beforeEachStateHook: () => T", () => {
		it("should add beforeEachStateHandler", function(done) {
			TestSM.onBeforeState(() => {
				done();
			});
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should add several beforeEachStateHandler", done => {
			TestSM.onBeforeState([
				noop,
				() => true,
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from beforeEachStateHandler", async () => {
			TestSM.onBeforeState([
				(_container, _from) => {
					// console.log(from.data);
				},
				() => true,
				() => false,
			]);

			const transitionResult = await TestSM.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(TestSM.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("AES: afterEachStateHook: () => T", () => {
		it("should add afterEachStateHandler", function(done) {
			TestSM.onAfterState(() => {
				done();
			});
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should add several afterEachStateHandler", function(done) {
			TestSM.onAfterState([
				() => undefined,
				() => true,
				() => {
					done();
				},
			]);
			TestSM.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from afterEachStateHandler", async () => {
			TestSM.onAfterState([() => undefined, () => true, () => false]);

			const transitionResult = await TestSM.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(TestSM.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("BT: beforeTransitionHandler: () => T", () => {
		it("should add several beforeTransitionHandler", done => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{ name: STATES.SOLID, data: {} },
						{
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							before: [
								() => undefined,
								() => true,
								() => {
									done();
								},
							],
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
						},
					],
				},
			);
			testStateMachine.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from beforeTransitionHandler", async () => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{ name: STATES.SOLID, data: {} },
						{
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							before: [noop, () => true, () => false],
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
						},
					],
				},
			);

			const transitionResult = await testStateMachine.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(testStateMachine.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("AT: afterTransitionHandler: () => T", () => {
		it("should add several afterTransitionHandler", done => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{ name: STATES.SOLID, data: {} },
						{
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
							after: [
								() => undefined,
								() => true,
								() => {
									done();
								},
							],
						},
					],
				},
			);
			testStateMachine.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from afterTransitionHandler", async () => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{ name: STATES.SOLID, data: {} },
						{
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
							after: [noop, () => true, () => false],
						},
					],
				},
			);

			const transitionResult = await testStateMachine.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(testStateMachine.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("BS: beforeStateHandler: () => T", () => {
		it("should add several beforeStateHandler", done => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{ name: STATES.SOLID, data: {} },
						{
							before: [
								() => undefined,
								() => true,
								() => {
									done();
								},
							],
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
						},
					],
				},
			);
			testStateMachine.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from beforeStateHandler", async () => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{ name: STATES.SOLID, data: {} },
						{
							before: [noop, () => true, () => false],
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
						},
					],
				},
			);

			const transitionResult = await testStateMachine.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(testStateMachine.state).toBe(STATES.SOLID);
			}
		});
	});

	describe("AS: afterStateHandler: () => T", () => {
		it("should add several afterStateHandler", done => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{
							name: STATES.SOLID,
							data: {},
							after: [
								() => undefined,
								() => true,
								() => {
									done();
								},
							],
						},
						{
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
						},
					],
				},
			);
			testStateMachine.transitTo(STATES.LIQUID);
		});

		it("should prevent transition from afterStateHandler", async () => {
			let testStateMachine = new StateMachine(
				STATES.SOLID,
				{
					states: [
						{
							name: STATES.SOLID,
							data: {},
							after: [noop, () => true, () => false],
						},
						{
							name: STATES.LIQUID,
							data: {},
						},
					],
				},
				{
					transitions: [
						{
							name: TRANSITIONS.MELT,
							from: STATES.SOLID,
							to: STATES.LIQUID,
						},
					],
				},
			);

			const transitionResult = await testStateMachine.transitTo(STATES.LIQUID);
			expect(transitionResult.isSuccess).toBe(true);
			if (transitionResult.isSuccess) {
				expect(testStateMachine.state).toBe(STATES.SOLID);
			}
		});
	});

	it("should run hooks in right order", async () => {
		const lifeCycleOrder: string[] = [];
		const lifeTestStateMachine = new StateMachine(
			STATES.SOLID,
			{
				before: [
					() => {
						lifeCycleOrder.push("8: BES");
					},
				],
				states: [
					{
						name: STATES.SOLID,
						data: { temperature: -100 },
						after: [
							() => {
								lifeCycleOrder.push("2: AS");
							},
						],
					},
					{
						before: [
							() => {
								lifeCycleOrder.push("7: BS");
							},
						],
						name: STATES.LIQUID,
						data: { temperature: 50 },
					},
					{
						name: STATES.GAS,
						data: { temperature: 200 },
					},
				],
				after: [
					() => {
						lifeCycleOrder.push("1: AES");
					},
				],
			},
			{
				before: [
					() => {
						lifeCycleOrder.push("3: BET");
					},
				],
				transitions: [
					{
						before: [
							() => {
								lifeCycleOrder.push("4: BT");
							},
						],
						name: TRANSITIONS.MELT,
						from: STATES.SOLID,
						to: STATES.LIQUID,
						after: [
							() => {
								lifeCycleOrder.push("5: AT");
							},
						],
					},
				],
				after: [
					() => {
						lifeCycleOrder.push("6: AET");
					},
				],
			},
		);
		await lifeTestStateMachine.doTransition(TRANSITIONS.MELT);
		expect(lifeCycleOrder).toEqual([
			"1: AES",
			"2: AS",
			"3: BET",
			"4: BT",
			"5: AT",
			"6: AET",
			"7: BS",
			"8: BES",
		]);
	});
});
