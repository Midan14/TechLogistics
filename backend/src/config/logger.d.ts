import { Logger } from 'winston';

export interface LogError {
  name?: string;
  message?: string;
  stack?: string;
  code?: string | number;
  status?: number;
}

export const logger: Logger;
export default logger;

export function logError(message: string, error?: Error | null): void;
export function logInfo(message: string, data?: Record<string, any>): void;
export function logWarning(message: string, data?: Record<string, any>): void;
export function logDebug(message: string, data?: Record<string, any>): void;
export function logHttp(message: string, meta?: Record<string, any>): void;
export function httpLogger(req: any, res: any, next: () => void): void;
