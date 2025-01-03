class apiError extends ERROR{
    constructor (
        stastusCode,
        message = "Something is went wrong ",
        errors = [],
        stack = ""
    ){
        super(message)
        this.stastusCode = stastusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this ,this.constructor)
        }
    }
}

export {apiError}