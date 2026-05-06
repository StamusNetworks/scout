import '@/common/design-system/molecules/html-code-display/pygments.css';
import { RouterProvider } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import '../global.css';
import { router } from '@/router';
import { persistor, store } from '@/store/store-instance';

import { Toaster } from '../common/design-system/atoms/ui/sonner';
import { AppLoader, SystemSettings } from './app.loader';

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <SystemSettings>
          <AppLoader>
            <NuqsAdapter>
              <RouterProvider router={router} />
            </NuqsAdapter>
            <Toaster />
          </AppLoader>
        </SystemSettings>
      </PersistGate>
    </Provider>
  );
}

export default App;
