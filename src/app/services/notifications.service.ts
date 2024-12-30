import { inject, Injectable, signal } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getFirebaseErrorMessage } from '../utilities/auth-error';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private snackbar = inject(MatSnackBar);


  loading = signal(false);

  showLoading() {
    this.loading.set(true);
  }

  hideLoading() {
    this.loading.set(false);
  }


  successMessage(message: string) {
    this.snackbar.open(message, undefined, {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  errorMessage(message: string) {
    this.snackbar.open(message, 'Close', {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  firebaseErrorMessage(error: FirebaseError) {
    this.errorMessage(getFirebaseErrorMessage(error));
  }
}
