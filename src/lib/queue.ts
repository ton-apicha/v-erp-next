import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';

// Use URL string directly for BullMQ connection
// This avoids ioredis version conflicts
const connectionOptions: ConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Queue names
export const QUEUE_NAMES = {
    PAYROLL: 'payroll-processing',
    NOTIFICATION: 'notifications',
    REPORT: 'report-generation',
    DOCUMENT_EXPIRY: 'document-expiry-check',
} as const;

// Create queue factory
export function createQueue(name: string) {
    return new Queue(name, {
        connection: connectionOptions,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 50,
        },
    });
}

// Create worker factory
export function createWorker<T>(
    name: string,
    processor: (job: Job<T>) => Promise<void>
) {
    return new Worker<T>(name, processor, {
        connection: connectionOptions,
        concurrency: 5,
    });
}

// Queues (lazy initialization)
let _payrollQueue: Queue | null = null;
let _notificationQueue: Queue | null = null;
let _reportQueue: Queue | null = null;
let _documentExpiryQueue: Queue | null = null;

export function getPayrollQueue() {
    if (!_payrollQueue) _payrollQueue = createQueue(QUEUE_NAMES.PAYROLL);
    return _payrollQueue;
}

export function getNotificationQueue() {
    if (!_notificationQueue) _notificationQueue = createQueue(QUEUE_NAMES.NOTIFICATION);
    return _notificationQueue;
}

export function getReportQueue() {
    if (!_reportQueue) _reportQueue = createQueue(QUEUE_NAMES.REPORT);
    return _reportQueue;
}

export function getDocumentExpiryQueue() {
    if (!_documentExpiryQueue) _documentExpiryQueue = createQueue(QUEUE_NAMES.DOCUMENT_EXPIRY);
    return _documentExpiryQueue;
}

// Job types
export interface PayrollJobData {
    payrollFileId: string;
    uploadedById: string;
}

export interface NotificationJobData {
    userId?: string;
    title: string;
    body: string;
    link?: string;
    priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
    channels: ('inApp' | 'email' | 'push' | 'line')[];
}

export interface ReportJobData {
    type: string;
    filters: Record<string, unknown>;
    userId: string;
}

// Add jobs
export async function addPayrollJob(data: PayrollJobData) {
    return getPayrollQueue().add('process', data);
}

export async function addNotificationJob(data: NotificationJobData) {
    return getNotificationQueue().add('send', data, {
        priority: data.priority === 'CRITICAL' ? 1 : data.priority === 'HIGH' ? 2 : 3,
    });
}

export async function addReportJob(data: ReportJobData) {
    return getReportQueue().add('generate', data);
}
