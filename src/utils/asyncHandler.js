// using Promise 
const asyncHandler = (functionName) =>{
    return (req, res,next) => {
    Promise.resolve(functionName(req, res,next))
    .catch((err) => next(err))
}}


// Using Try Catch Method

// const asyncHandler = (functionName) => async (req, res, next) => {
//     try {
//         await functionName(req,res,next)
//     } catch (error) {
//         res.status(500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }

export {asyncHandler}