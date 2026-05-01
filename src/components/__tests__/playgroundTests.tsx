import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';

export function createLogCollector() {
  const logs: string[] = [];

  const origLog = console.log;

  console.log = (...args: unknown[]) => logs.push(args.map(String).join(' '));

  return {
    snapshot: () => [...logs],
    restore: () => {
      console.log = origLog;
    }
  };
}

export async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
}

export type PlaygroundConfig = {
  describeName: string;
  heading: string;
  importComponent: () => Promise<ComponentType>;
};

async function setup(config: PlaygroundConfig) {
  const collector = createLogCollector();

  const Comp = await config.importComponent();
  const utils = render(<Comp />);

  await screen.findByText(config.heading);
  await flush();

  return {
    ...utils,
    snapshot: collector.snapshot,
    restore: collector.restore,
    cleanup: () => {
      utils.unmount();
      collector.restore();
    }
  };
}

export function createPlaygroundTests(config: PlaygroundConfig) {
  describe(config.describeName, () => {
    beforeEach(() => {
      vi.resetModules();
    });

    test('mount only', async () => {
      const { cleanup, snapshot, restore } = await setup(config);
      const logs = snapshot();
      restore();
      console.log(logs.join('\n'));
      cleanup();
    });

    test('mount + click unrelatedCount', async () => {
      const { cleanup, snapshot, restore } = await setup(config);

      const unrelatedButton = screen.getAllByText('+1')[2];
      await userEvent.click(unrelatedButton);
      await flush();

      const logs = snapshot();
      restore();
      console.log(logs.join('\n'));
      cleanup();
    });

    test('mount + click bears', async () => {
      const { cleanup, snapshot, restore } = await setup(config);

      const bearsButton = screen.getAllByText('+1')[0];
      await userEvent.click(bearsButton);
      await flush();

      const logs = snapshot();
      restore();
      console.log(logs.join('\n'));
      cleanup();
    });
  });
}

type Scenario =
  | 'mount only'
  | 'mount + click unrelatedCount'
  | 'mount + click bears';

function normalizeLogs(
  logs: string[],
  referencePrefix: string,
  derivedPrefix: string
): string[] {
  return logs.map((log) => log.replace(referencePrefix, derivedPrefix));
}

async function captureScenario(
  config: PlaygroundConfig,
  scenario: Scenario
): Promise<string[]> {
  const { cleanup, snapshot, restore } = await setup(config);

  if (scenario === 'mount + click unrelatedCount') {
    const unrelatedButton = screen.getAllByText('+1')[2];
    await userEvent.click(unrelatedButton);
    await flush();
  }

  if (scenario === 'mount + click bears') {
    const bearsButton = screen.getAllByText('+1')[0];
    await userEvent.click(bearsButton);
    await flush();
  }

  const logs = snapshot();
  restore();
  cleanup();
  return logs;
}

export function createEquivalenceTests(config: {
  referencePrefix: string;
  derivedPrefix: string;
  reference: PlaygroundConfig;
  derived: PlaygroundConfig;
}) {
  describe(`${config.derivedPrefix} matches ${config.referencePrefix}`, () => {
    beforeEach(() => {
      vi.resetModules();
    });

    const scenarios: Scenario[] = [
      'mount only',
      'mount + click unrelatedCount',
      'mount + click bears'
    ];

    for (const scenario of scenarios) {
      test(scenario, async () => {
        const referenceLogs = await captureScenario(config.reference, scenario);
        const derivedLogs = await captureScenario(config.derived, scenario);

        const normalizedReference = normalizeLogs(
          referenceLogs,
          config.referencePrefix,
          config.derivedPrefix
        );

        expect(derivedLogs).toEqual(normalizedReference);
      });
    }
  });
}
