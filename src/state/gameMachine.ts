import { createMachine, assign } from 'xstate';
import type { GameState } from '../types';

const initialContext: GameState = {
  currentDistrict: null,
  currentBuilding: null,
  activeAbility: null,
  completedScenarios: [],
  unlockedAbilities: [],
  metrics: {},
};

// XState машина для управления игровым состоянием
export const gameMachine = createMachine({
  id: 'game',
  initial: 'loading',
  context: initialContext,
  types: {} as {
    events:
      | { type: 'DATA_LOADED'; abilities: string[] }
      | { type: 'LOAD_ERROR' }
      | { type: 'RETRY' }
      | { type: 'TELEPORT_TO_BUILDING'; buildingId: string; districtId?: string }
      | { type: 'ACTIVATE_ABILITY'; abilityId: string }
      | { type: 'DEACTIVATE_ABILITY' }
      | { type: 'OPEN_DIALOGUE' }
      | { type: 'RETURN_TO_HUB' }
      | { type: 'ENTER_BUILDING' }
      | { type: 'COMPLETE_STEP'; stepId: string }
      | { type: 'COMPLETE_SCENARIO'; scenarioId: string }
      | { type: 'EXIT_SCENARIO' }
      | { type: 'SELECT_CHOICE'; nodeId: string }
      | { type: 'CLOSE_DIALOGUE' };
  },
  states: {
    loading: {
      on: {
        DATA_LOADED: {
          target: 'hub',
          actions: assign({
            unlockedAbilities: ({ event }) => event.abilities || [],
          }),
        },
        LOAD_ERROR: 'error',
      },
    },
    error: {
      on: {
        RETRY: 'loading',
      },
    },
    hub: {
      on: {
        TELEPORT_TO_BUILDING: {
          target: 'exploring',
          actions: assign({
            currentBuilding: ({ event }) => event.buildingId,
            currentDistrict: ({ event }) => event.districtId || null,
          }),
        },
        ACTIVATE_ABILITY: {
          target: 'usingAbility',
          actions: assign({
            activeAbility: ({ event }) => event.abilityId,
          }),
        },
        OPEN_DIALOGUE: 'dialogue',
      },
    },
    exploring: {
      on: {
        ENTER_BUILDING: 'inScenario',
        RETURN_TO_HUB: {
          target: 'hub',
          actions: assign({
            currentBuilding: () => null,
            currentDistrict: () => null,
          }),
        },
        ACTIVATE_ABILITY: {
          target: 'usingAbility',
          actions: assign({
            activeAbility: ({ event }) => event.abilityId,
          }),
        },
      },
    },
    usingAbility: {
      after: {
        10000: {
          target: 'hub',
          actions: assign({
            activeAbility: () => null,
          }),
        },
      },
      on: {
        DEACTIVATE_ABILITY: {
          target: 'hub',
          actions: assign({
            activeAbility: () => null,
          }),
        },
      },
    },
    inScenario: {
      on: {
        COMPLETE_STEP: {
          actions: assign({
            metrics: ({ context, event }) => ({
              ...context.metrics,
              [event.stepId]: (context.metrics[event.stepId] || 0) + 1,
            }),
          }),
        },
        COMPLETE_SCENARIO: {
          target: 'hub',
          actions: assign({
            completedScenarios: ({ context, event }) => [
              ...context.completedScenarios,
              event.scenarioId,
            ],
            currentBuilding: () => null,
          }),
        },
        EXIT_SCENARIO: {
          target: 'hub',
          actions: assign({
            currentBuilding: () => null,
          }),
        },
      },
    },
    dialogue: {
      on: {
        SELECT_CHOICE: {},
        CLOSE_DIALOGUE: 'hub',
      },
    },
  },
});
