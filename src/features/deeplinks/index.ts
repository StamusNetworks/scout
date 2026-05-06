// model
export type { CreateDeeplink, Deeplink } from './model/deep-link';
export { deeplinkCreateSchema } from './model/deep-link';

// api
export {
  useCreateDeepLinkMutation,
  useDeleteDeepLinkMutation,
  useGetDeeplinksQuery,
  useUpdateDeepLinkMutation,
} from './api/deeplinks.api';

// components
export { DeeplinksForm } from './components/deeplinks-form/deeplinks-form';
export { DeeplinksTable } from './components/deeplinks-table/deeplinks-table';
