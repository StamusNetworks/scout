import '../global.css';
import '@/common/design-system/molecules/htmlCodeDisplay/pygments.css';

import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { setupStore } from '@/store/store';

import { Toaster } from '../common/design-system/atoms/ui/sonner';
import { Router } from '../pages/router';
import { AppLoader, SystemSettings } from './app.loader';

export const store = setupStore();
export const persistor = persistStore(store);

function App() {
  return (
    <PersistGate
      loading={null}
      persistor={persistor}
    >
      <Provider store={store}>
        <SystemSettings>
          <AppLoader>
            <NuqsAdapter>
              <Router />
            </NuqsAdapter>
            <Toaster />
          </AppLoader>
        </SystemSettings>
      </Provider>
    </PersistGate>
  );
}

export default App;
