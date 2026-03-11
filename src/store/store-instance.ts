import { persistStore } from 'redux-persist';

import { setupStore } from './store';

export const store = setupStore();
export const persistor = persistStore(store);
