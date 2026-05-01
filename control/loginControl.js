// Aquí va tu lógica de Firebase u otro auth
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../firebaseConfig';

export async function loginUsuario(email, password) {
  if (!email || !password) {
    throw new Error('Completa todos los campos');
  }

  // Con Firebase:
  // const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // return userCredential.user;

  // Por ahora para el prototipo:
  return { email, uid: 'demo-123' };
}