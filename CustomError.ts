export type CustomErrorType = {
    message: string;
    statusCode: number;
}

export default class CustomError extends Error {
    public readonly statusCode: number;
    public readonly message: string;
    constructor(error: CustomErrorType) {
        super()
        this.statusCode = error.statusCode;
        this.message= error.message;

        Object.setPrototypeOf(this, CustomError.prototype);
    }

}