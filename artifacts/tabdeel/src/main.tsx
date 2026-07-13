import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

setBaseUrl('https://zooming-beauty-production-bb54.up.railway.app');

createRoot(document.getElementById('root')!).render(<App />);