declare global {
  namespace Express {
    interface User {
      // Всегда присутствует после passport-steam callback и после JWT auth
      steamId: string;
      // Присутствует только после JWT auth middleware (не в passport callback)
      userId?: string;
      // Присутствует только после passport-steam callback
      displayName?: string;
      avatar?: string;
    }
  }
}

export {};
