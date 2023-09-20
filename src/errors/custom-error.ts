

class CustomAPIError extends Error {
    message: string;
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }


}

const createCustomError = (msg: string, statusCode: number) => {
    return new CustomAPIError(msg, statusCode)
}

export { CustomAPIError, createCustomError }