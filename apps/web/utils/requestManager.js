
class RequestManager {
  constructor() {
    this.controllers = new Map();
  }

  getSignal(requestId) {
    if (this.controllers.has(requestId)) {
      this.controllers.get(requestId).abort();
    }
    
    const controller = new AbortController();
    this.controllers.set(requestId, controller);
    
    return controller.signal;
  }
  clear(requestId) {
    this.controllers.delete(requestId);
  }
}
export const requestManager = new RequestManager();