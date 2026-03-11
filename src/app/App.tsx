import '../global.css';
import '@/common/design-system/molecules/htmlCodeDisplay/pygments.css';

import { RouterProvider } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { router } from '@/router';
import { persistor, store } from '@/store/store-instance';

import { Toaster } from '../common/design-system/atoms/ui/sonner';
import { AppLoader, SystemSettings } from './app.loader';

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
              <RouterProvider router={router} />
            </NuqsAdapter>
            <Toaster />
          </AppLoader>
        </SystemSettings>
      </Provider>
    </PersistGate>
  );
}

export default App;
