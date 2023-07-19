const { extractUserId, handleErrors } = require('./helpers')
const { retrieveUser } = require('../logic')

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)

  const promise = retrieveUser(userId)

  return (async () => {
    const user = await promise

    res.send(user)
  })()

  // return retrieveUser(userId)
  //   .then(user => res.json(user))
})