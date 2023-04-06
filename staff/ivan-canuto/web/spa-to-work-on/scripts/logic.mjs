import { users } from './data.mjs'
import { validateName, validateEmail, validatePassword, validateAvatarUrl } from './validators.mjs'

export function registerUser(name, email, password) {

  validateName(name)
  validateEmail(email)
  if (!email.includes('@')) throw new Error("Email doesn't contain a '@'.")
  if (!email.includes('.')) throw new Error("Email doesn't contain a'.', try to put a dot whithin the domain part.")
  validatePassword(password)
  if (password.length < 6) throw new Error('The password is too short.')

  var user = findUserByEmail(email)
  if (user) throw new Error('User already exists.')

  let id = 'user-1'
  
  let lastUser = users[users.length - 1]
  if(lastUser) id = 'user-' + (parseInt(lastUser.id.slice(5)) + 1)

  users.push({
      id,
      name,
      email,
      password,
      avatar: 'https://img.freepik.com/iconos-gratis/icono-perfil-usuario_318-33925.jpg'
  })
}

export function authenticateUser(email, password) {

  validateEmail(email)
  validatePassword(password)

  const user = findUserByEmail(email)

  if (!user) throw new Error('User not found.')
  if (user.password !== password) throw new Error('Password is incorrect.')

  return user.id  
}

export function retrieveUser(userId) {

  if (!userId.length) throw new Error("This email doesn't exist.")
  if (typeof userId !== 'string') throw new Error('Eamil is not a string.')

  let user = findUserById(userId)

  if (!user) throw new Error('User not found.')

  user = {
    id: user.id,
    name: user.name,
    avatar: user.avatar
  }
  return user
}

// function updateUserEmail(email, newEmail, newEmailConfirm, password) {
  
//   var user = findUserById(userId)
//   if (!user) throw new Error('User not found')
//   validateEmail(email)
//   if (email !== user.email) throw new Error('The email is incorrect');
//   validateEmail(newEmail, 'new email')
//   validateEmail(newEmailConfirm, 'new email confirmation')
//   const correctEmail = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
//   if (!correctEmail.test(newEmail)) throw new Error(`The new email entered is not valid.`);
//   if (newEmail === email) throw new Error('New email cannot be the same as the old email.')
//   if (newEmail !== newEmailConfirm) throw new Error('New emails do not match.')

//   if (user.password !== password) throw new Error('The password is not correct.')

//   user.email = newEmail
//   authenticatedEmail = newEmail
// }

export function updateUserPassword(email, password, newPassword, newPasswordConfirm) {

  var user = findUserById(email)
  if (!user) throw new Error('User not found')
  validatePassword(password)
  if (password !== user.password) throw new Error('The password is incorrect.');
  validatePassword(newPassword, 'new password')
  validatePassword(newPassword, 'new password confirmation')
  if (newPassword.length < 6) throw new Error('New password is too short.');
  if (newPassword === password) throw new Error('New password cannot be the same as the old password.')
  if (newPassword !== newPasswordConfirm) throw new Error('New passwords do not match.')

  user.password = newPassword
}

export function updateUserAvatar(userId, newAvatarUrl, password) {
const avatarImage = document.querySelector('.avatar-image')
var user = findUserById(userId)

  if (!user) throw new Error('User not found')
  validateAvatarUrl(newAvatarUrl)
  if (newAvatarUrl === user.avatar) throw new Error('New avatar cannot be the same as the old avatar.')
  validatePassword(password)
  if (password !== user.password) throw new Error('The password is incorrect');

  user.avatar = newAvatarUrl
  avatarImage.src = user.avatar
}

// Helpers
const findUserByEmail = (email)=> {
  let user;

  for (let i = 0; i < users.length; i++) {
    
    if (users[i].email === email) {
      user = users[i];
      return user;
    }
  }
}

const findUserById = (userId)=> {
  let user;

  for (let i = 0; i < users.length; i++) {
    
    if (users[i].id === userId) {
      user = users[i];
      return user;
    }
  }
}
