const { deleteComment } = require('../logic')
const { extractUserId, handleErrors } = require('./helpers')

module.exports = handleErrors((req, res) => {
  const userId = extractUserId(req)
  const { postId, commentId } = req.params

  const promise = deleteComment(userId, postId, commentId)

  return (async () => {
    await promise

    res.send()
  })()

  // return deleteComment(userId, postId, commentId)
  //   .then(() => res.send())
})