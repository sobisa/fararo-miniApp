import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

import { Provider } from './components/ui/provider.tsx';
import App from './app/App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>
);
