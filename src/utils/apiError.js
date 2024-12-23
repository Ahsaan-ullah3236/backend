class apiError extends ERROR{
    constructor (
        stastusCode,
        message = "Something is went wrong ",
        errors = [],
        statck = ""
    ){
        super(message)
        this.stastusCode = stastusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors



        if (statck){
            this.statck = statck
        }else{
            Error.captureStackTrace(this ,this.constructor)
        }
    }
}

export {apiError}