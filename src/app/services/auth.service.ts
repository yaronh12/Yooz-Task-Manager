import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, User, UserCredential } from '@angular/fire/auth';
import { authState } from 'rxfire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { getAdditionalUserInfo, getAuth, GoogleAuthProvider, signInWithPopup, UserProfile } from 'firebase/auth';
import { Task } from '../models/user';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  firebaseAuth = inject(Auth);

  currentUser$ = authState(this.firebaseAuth);
  currentUser = toSignal(this.currentUser$);

  // Sign in with email and password
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  // Sign out
  logout(): Promise<void> {
    return signOut(this.firebaseAuth);
  }

  // Sign up with email and password
  signup(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  // Set the user's full name
  setFullName(user: User, fullName: string) {
    return updateProfile(user, { displayName: fullName });
  }

  // Send a password reset email
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.firebaseAuth, email);
  }



  // Sign in with Google
  async googleLogin(): Promise<UserProfile | null> {

    try {
      const userCredential = await signInWithPopup(this.firebaseAuth, new GoogleAuthProvider());
      const additionalUserInfo = getAdditionalUserInfo(userCredential);

      if (!additionalUserInfo?.isNewUser) {
        return Promise.resolve(null);
      }

      const {
        user: { displayName, uid, email }
      } = userCredential

      const emptyTasksArray: Task[] = [];
      const emptyChangesArray: string[] = [];

      const newUser = {
        uid,
        email,
        fullName: displayName ?? 'User',
        tasks: emptyTasksArray,
        changes: emptyChangesArray
      }

      return Promise.resolve(newUser);
    } catch (error) {
      console.error(error);
      return null;
    }




  }

}
