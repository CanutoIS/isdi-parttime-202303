import { retrievePosts } from "./retrievePosts"
import { validators } from 'com'

const { validateId, validateCallback } = validators

/**
 * Retrieves a post form database.
 * 
 * @param {string} userId The user's id.
 * @param {string} postId The post's id.
 * @param {function} callBack A function to catch errors and display them to the user., and returns the post information required.
 * 
*/

export default function retrievePost(userId ,postId, callBack) {
  validateId(userId, 'user id')
  validateId(postId, 'post id')
  validateCallback(callBack)

  retrievePosts(userId, (error, _posts) => {
    if (error) {
      callBack(error)

      return
    }

    const post = _posts.find(post => post.id === postId)
  
    callBack(null, post)
  })
}