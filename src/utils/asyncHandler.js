

// async function try and catch
const asyncHandler=(fn)=>{
    async(res,req,next)=>{
        try{
            await fn(req,res,next);
        }catch(error){
            res.status(error.code || 500).json({
                message:error.message,
                success:false
            })
        }
    }
}

export {asyncHandler}