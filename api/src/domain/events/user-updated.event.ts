export const USER_UPDATED_EVENT = 'user.updated';

export type UserUpdatedEvent = {
    entity: 'users';
    entityId: string;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown>;
    performedBy: string;
    timestamp: string;
};
