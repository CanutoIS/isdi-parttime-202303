const { readFile, writeFile } = require('fs')

function setPostPrice(postId, postPrice, callBack) {
  // validateId(postId, 'post id')

  readFile('./data/posts.json', 'utf8', (error, postsJSON) => {
    if(error) {
      callBack(error)
      
      return
    }

    const posts = JSON.parse(postsJSON)
    const post = posts.find(post => post.id === postId)

    if(!post) {
      callBack(new Error('Sorry, the post does not exist.'))

      return
    }

    post.onSale = postPrice

    const postIndex = posts.findIndex(post => post.id === postId)

    posts.splice(postIndex, 1, post)
    const postsToJSON = JSON.stringify(posts)

    writeFile('./data/posts.json', postsToJSON, 'utf8', (error) => {
      if(error) {
        callBack(error)

        return
      }

      callBack(null)
    })
  })
}

function unsetPostPrice(postId, callBack) {

  readFile('./data/posts.json', 'utf8', (error, postsJSON) => {
    if(error) {
      callBack(error)

      return
    }

    const posts = JSON.parse(postsJSON)
    const post = posts.find(post => post.id === postId)

    if(!post) {
      callBack(new Error('Sorry, the post does not exist.'))

      return
    }

    post.onSale = null

    const postIndex = posts.findIndex(post => post.id === postId)

    posts.splice(postIndex, 1, post)
    const postsToJSON = JSON.stringify(posts)

    writeFile('./data/posts.json', postsToJSON, 'utf8', (error) => {
      if(error) {
        callBack(error)

        return
      }

      callBack(null)
    })
  })
}

module.exports = {
  setPostPrice,
  unsetPostPrice
}