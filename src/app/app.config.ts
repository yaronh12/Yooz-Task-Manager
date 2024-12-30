import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBt7Nk7YaVcQnX9ymzj3xbBXOOhV0mNSRY",
  authDomain: "yooz-task-manager.firebaseapp.com",
  projectId: "yooz-task-manager",
  storageBucket: "yooz-task-manager.firebasestorage.app",
  messagingSenderId: "1036415235021",
  appId: "1:1036415235021:web:df2ba3d4336fca8a394a84"
};

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations(), importProvidersFrom([
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MatSnackBarModule
  ])]
};
