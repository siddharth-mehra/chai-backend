class ApiError extends Error {
    constructor( 
        statusCode,
        message='Something went wrong',
        errors=[],
        stack=""){
            super(message);
            this.statusCode=statusCode;
            this.errors=errors;
            this.stack=stack;
            this.data=null,
            this.success=false;


            if(stack){
                this.stack=stack
            }else{
                Error.captureStackTrace(this,this.constructor);
            }
    }
}

class ApiResponse {
    constructor(statusCode,data,success=true,message="Success"){
        this.data=data;
        this.success=success;
        this.statusCode=statusCode<400;
        this.message=message
    }
}


export {ApiResponse,ApiError}