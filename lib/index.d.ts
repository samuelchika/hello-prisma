import { Request } from "express";
export type verifyTokenProps = {
  valid: boolean;
  message?: string;
  payload?: Record<object, unknown>
}


export interface IGetUserAuthInfoRequest extends Request {
  user?: {
          id: string;
          email: string;
          firstname: string;
          lastname: string;
          password?: string;
          phone: number;
          role?: 'USER' | 'ADMIN';
          active?: boolean;
          createdAt?: Date;
          updatedAt?: Date;

      }
}

export type UserProps ={
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  password?: string;
  phone: number;
  role?: 'USER' | 'ADMIN';
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}