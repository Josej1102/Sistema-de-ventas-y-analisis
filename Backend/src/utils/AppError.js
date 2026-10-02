class AppError extends Error{
    constructor(message, statuscode = 500){

        super(message);
        this.statusCode = statuscode;
        this.name = 'AppError';
    }
}

module.exports = AppError;