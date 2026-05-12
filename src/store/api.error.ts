import { toast } from 'sonner';

type ApiRequestArgs =
  | string
  | {
      url?: string;
      method?: string;
    };

type ApiError =
  | {
      status?: number | string;
      data?: unknown;
      error?: unknown;
    }
  | unknown;

const isUnauthenticatedStatus = (status: unknown) =>
  status === 401 || status === 403 || status === '401' || status === '403';

const isUnauthenticatedError = (error: ApiError) => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const errorRecord = error as Record<string, unknown>;
  return (
    isUnauthenticatedStatus(errorRecord.status) ||
    isUnauthenticatedStatus(errorRecord.originalStatus)
  );
};

const isAbortLikeError = (error: ApiError) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const errorRecord = error as Record<string, unknown>;
  const name = typeof errorRecord.name === 'string' ? errorRecord.name : '';
  if (name === 'AbortError') {
    return true;
  }

  const message =
    typeof errorRecord.message === 'string' ? errorRecord.message : '';
  if (message.toLowerCase().includes('abort')) {
    return true;
  }

  const errorField =
    typeof errorRecord.error === 'string' ? errorRecord.error : '';
  if (errorField.toLowerCase().includes('abort')) {
    return true;
  }

  return false;
};

const getRequestInfo = (args: ApiRequestArgs) => {
  if (typeof args === 'string') {
    return { method: 'GET', url: args };
  }

  const method = args.method ?? 'GET';
  const url = args.url ?? '';
  return { method, url };
};

const getTitle = (error: ApiError) => {
  if (!error || typeof error !== 'object') {
    return 'Request failed';
  }

  const status =
    (error as { originalStatus?: number })?.originalStatus ??
    (error as { status?: unknown }).status;
  if (typeof status === 'number') {
    return `Request failed (${status})`;
  }

  return 'Request failed';
};

export const apiErrorToast = (params: {
  args: ApiRequestArgs;
  error: ApiError;
}) => {
  const { args, error } = params;

  if (isAbortLikeError(error) || isUnauthenticatedError(error)) {
    return;
  }

  const { method, url } = getRequestInfo(args);

  toast.error(getTitle(error), {
    description: url ? `${method} ${url}` : undefined,
  });
};
