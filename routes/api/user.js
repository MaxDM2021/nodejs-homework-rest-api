const express = require("express");
const { tryCatchWrapper } = require("../../helpers/index");
const { auth } = require("../../middlewares/index");

const { createContact, getContacts, me } = require("../../controllers/user.controller");

const userRouter = express.Router();

userRouter.post('/contacts',tryCatchWrapper(auth),  tryCatchWrapper(createContact));
userRouter.get('/contacts', tryCatchWrapper(auth), tryCatchWrapper(getContacts));
userRouter.get('/me', tryCatchWrapper(auth), tryCatchWrapper(me));


module.exports ={
    userRouter,
}


// router.get('/', async (req, res, next) => {
//   res.json({ message: 'Home work №2 done!!' })
// })

// router.get('/:contactId', async (req, res, next) => {
//   res.json({ message: 'template message' })
// })

// router.post('/', async (req, res, next) => {
//   res.json({ message: 'template message' })
// })

// router.delete('/:contactId', async (req, res, next) => {
//   res.json({ message: 'template message' })
// })

// router.put('/:contactId', async (req, res, next) => {
//   res.json({ message: 'template message' })
// })

// module.exports = router