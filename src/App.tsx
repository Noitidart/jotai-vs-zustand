import { JotaiPlayground } from './components/JotaiPlayground';
import { ZustandStorePlainPlayground } from './components/ZustandStorePlainPlayground';
import { ZustandStoreSubscribeWithSelectorPlayground } from './components/ZustandStoreSubscribeWithSelectorPlayground';
import { ZustandSelectorPlayground } from './components/ZustandSelectorPlayground';

function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Bears: Jotai vs Zustand</h1>
      <p style={{ marginBottom: 16 }}>
        Try changing <code>unrelatedCount</code> — watch the console to see when
        derivations fire vs when components actually re-render.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <JotaiPlayground />
        <ZustandStorePlainPlayground />
        <ZustandStoreSubscribeWithSelectorPlayground />
        <ZustandSelectorPlayground />
      </div>
    </div>
  );
}

export default App;
