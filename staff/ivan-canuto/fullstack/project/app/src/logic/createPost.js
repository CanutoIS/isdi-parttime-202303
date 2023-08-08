import { validators, errors } from 'com'
import context from './context'

const { validateText } = validators

/**
 * Creates a post by reciving the user's id, and an image provided with an url or selected from the own ones (only one can be used).
 * 
 * @param {string} image The image of the post.
 * @param {string} postText The description of the post.
 */

export default function createPost (summary, conversationId) {
  validateText(summary, 'summary text')

  return (async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/conversations/${conversationId}/newPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.token}`
      },
      body: JSON.stringify({ summary })
    })

    if(res.status === 200)
      return
    
    const { type, message } = await res.json()

    const clazz = errors[type]

    throw new clazz(message)
  })()
}
