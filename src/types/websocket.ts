export type WebSocketEventType =
  | 'welcome'
  | 'message'
  | 'authenticate'
  | 'task.created'
  | 'task.updated'
  | 'task.deleted';

export type WebSocketEvent = {
  type: WebSocketEventType;
  data: unknown;
};