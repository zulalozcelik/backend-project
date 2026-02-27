export const USER_CREATED_EVENT = 'user.created';

export type UserCreatedEvent = {
    entity: 'users';
    entityId: string;
    newData: Record<string, unknown>;
    performedBy: string;
    timestamp: string;
};
