import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';

function createLogCollector() {
  const logs: string[] = [];

  const origLog = console.log;

  console.log = (...args: unknown[]) => logs.push(args.map(String).join(' '));

  return {
    snapshot: () => [...logs],
    restore: () => { console.log = origLog; },
  };
}

async function flush() {
  await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
}

export function createPlaygroundTests(config: {
  describeName: string;
  heading: string;
  importComponent: () => Promise<ComponentType>;
}) {
  describe(config.describeName, () => {
    beforeEach(() => { vi.resetModules(); });

    async function setup() {
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
        },
      };
    }

    test('mount only', async () => {
      const { cleanup, snapshot, restore } = await setup();
      const logs = snapshot();
      restore();
      console.log(logs.join('\n'));
      cleanup();
    });

    test('mount + click unrelatedCount', async () => {
      const { cleanup, snapshot, restore } = await setup();

      const unrelatedButton = screen.getAllByText('+1')[2];
      await userEvent.click(unrelatedButton);
      await flush();

      const logs = snapshot();
      restore();
      console.log(logs.join('\n'));
      cleanup();
    });

    test('mount + click bears', async () => {
      const { cleanup, snapshot, restore } = await setup();

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
