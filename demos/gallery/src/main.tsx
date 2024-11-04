import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { App } from './App.tsx'

import "@hpcc-js/common/font-awesome/css/font-awesome.min.css";
import "@hpcc-js/common/dist/index.css";
import "@hpcc-js/api/dist/index.css";
import "@hpcc-js/codemirror/dist/index.css";
import "@hpcc-js/chart/dist/index.css";
import "@hpcc-js/phosphor/dist/index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme}>
      <App />
    </FluentProvider>
  </StrictMode>
)
