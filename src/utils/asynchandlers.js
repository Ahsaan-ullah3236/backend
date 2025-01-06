// with the help of promises
const asynchandler = (requesthandler) => {
 return (req, res, next) => {
    Promise.resolve(requesthandler(req, res, next)).
    catch((err) => next(err))
  }
}

export {asynchandler}

// with the help or try catch
// const asynchandler = () => {};
// const asynchandler = (func) => () => {};
// const asynchandler = (func) => async () => {};

// const asynchandler = (fn) => async (req,res,next) => {
//     try {

//     } catch (error) {
//         res.status(err.code || 500 ) .json ({
//             success: false,
//             message: err.message
//         })
//     }
// };
