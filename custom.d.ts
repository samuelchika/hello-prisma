declare namespace Express {
  interface Request {
    user: {
      id: string;
    };
  }
}

declare module 'googleapi'