import { JotaiPlayground } from './components/JotaiPlayground';
import { ZustandSelectorPlayground } from './components/ZustandSelectorPlayground';
import { ZustandStorePlainPlayground } from './components/ZustandStorePlainPlayground';
import { ZustandStoreSubscribeWithSelectorPlayground } from './components/ZustandStoreSubscribeWithSelectorPlayground';

function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Bears: Jotai vs Zustand</h1>
      <p style={{ marginBottom: 4, color: '#888', fontSize: 14 }}>
        Automated tests: <code>npm test</code> (run via vitest, 3 scenarios per
        playground)
      </p>
      <p style={{ marginBottom: 4 }}>Manual testing steps:</p>
      <ol
        style={{
          marginBottom: 16,
          lineHeight: 2,
          maxWidth: 600,
          textAlign: 'left',
          margin: '0 auto 16px auto'
        }}
      >
        <li>Open DevTools console</li>
        <li>Reload the page — note the mount logs</li>
        <li>
          Click <strong>unrelatedCount +1</strong> — did the computation fire?
          did the display re-render?
        </li>
        <li>
          Reload the page, then click <strong>bears +1</strong> — computation
          fires, display re-renders
        </li>
        <li>Repeat for each playground and compare</li>
      </ol>
      <div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <JotaiPlayground />
        <ZustandStorePlainPlayground />
        <ZustandStoreSubscribeWithSelectorPlayground />
        <ZustandSelectorPlayground />
      </div>
    </div>
  );
}

export default App;
