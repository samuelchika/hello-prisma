declare namespace Express {
  interface Request {
    user: {
      id: string;
      firstname: string;
      lastname: string;
      phone: string;
      email: string;
      password: string;
      confirm_password: string;
    };
  }
}

declare module 'googleapi'