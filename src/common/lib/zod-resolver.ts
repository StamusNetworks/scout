import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, Resolver } from 'react-hook-form';
import { z } from 'zod';

/**
 * Wraps zodResolver to handle zod v4's ZodError shape (`.issues`)
 * which @hookform/resolvers@3.x does not recognise (it expects `.errors`).
 * Without this, refinement failures during initial form mount surface as
 * unhandled rejections that crash test runs configured to re-throw them.
 */
export const zodV4Resolver = <T extends FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any>,
): Resolver<T> => {
  const inner = zodResolver(schema) as Resolver<T>;
  return async (values, context, options) => {
    try {
      return await inner(values, context, options);
    } catch (err) {
      const issues = (
        err as {
          issues?: { path: PropertyKey[]; message: string; code: string }[];
        }
      )?.issues;
      if (Array.isArray(issues)) {
        const errors: Record<string, { message: string; type: string }> = {};
        for (const issue of issues) {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = {
              message: issue.message,
              type: issue.code,
            };
          }
        }
        return {
          values: {} as T,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errors: errors as any,
        };
      }
      throw err;
    }
  };
};
