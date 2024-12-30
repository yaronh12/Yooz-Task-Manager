import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { passwordsMatchValidator } from '../sign-up/sign-up.component';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/services/notifications.service';
import { updateEmail, UserProfile } from '@angular/fire/auth';
import { UsersService } from 'src/app/services/users.service';
import { doc, Firestore, arrayUnion, updateDoc } from '@angular/fire/firestore';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="card mat-elevation-z5">
    <h3 class="mat-headline-5 login-title">Edit Profile</h3>
      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <mat-form-field>
            <mat-label>Full Name</mat-label>
            
            <input matInput formControlName="displayName">
            <!-- Error messages -->
            <mat-error *ngIf="displayName?.hasError('required')">
                Full name is required
            </mat-error>
        </mat-form-field>
        <mat-form-field>        
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">              
              <!-- Error messages -->
              <mat-error *ngIf="email?.hasError('required')">
                  Email address is required
              </mat-error>            
              <mat-error *ngIf="email?.hasError('email')">
                  Please enter a valid email address
              </mat-error>
          </mat-form-field>
        <div class="resetButtons">
          <div >
              <button mat-button type="button" (click)="resetPassword()" >
                  Reset Password
              </button>
          </div>
        </div>
        
       
          <div class="center margin-top">
              <button type="submit" mat-raised-button color="primary">Save</button>
          </div>
          <div class="link-button-div"> 
              <button type="button" mat-button class="link-button" routerLink="/">
                return to home
              </button>
          </div>
      </form>
    </div>
  `,
  styles: [`
    .resetButtons {
      display: flex !important;
      justify-content: center;
    }
    `
  ]
})
export class ProfileComponent {
  formbuilder = inject(FormBuilder);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  usersService = inject(UsersService);
  firestore = inject(Firestore);
  originalProfile: UserProfile | null = null;

  profileForm = this.formbuilder.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });


  // Save the updated profile
  async saveProfile() {
    const currentUser = await firstValueFrom(this.authService.currentUser$);
    if (!currentUser) {
      console.error('User is not available');
      return;
    }

    const { displayName, email } = this.profileForm.value;

    if (!this.profileForm.valid || !displayName || !email) {
      return;
    }

    const ref = doc(this.firestore, 'users', currentUser.uid);
    const updatedProfile = this.profileForm.value as UserProfile;
    let changesStr = '';
    const timestamp = new Date().toISOString();
    const originalEmail = this.authService.currentUser()?.email
    const originalDisplayName = this.authService.currentUser()?.displayName;


    // Compare original and updated profile data to determine changes
    if (originalEmail !== updatedProfile['email']) {
      console.log('Email changed');
      changesStr = changesStr + ` Email changed from ${originalEmail} to ${updatedProfile['email']}`;
    }
    if (originalDisplayName !== updatedProfile['displayName']) {
      console.log('Full name changed');
      changesStr = changesStr + ` Full name changed from ${originalDisplayName} to ${updatedProfile['displayName']}`;
    }
    // Add other profile fields comparison as needed
    console.log(changesStr);

    try {
      this.notificationService.showLoading();
      // Update the user's display name and email in Firebase Authentication
      await this.authService.setFullName(currentUser, displayName);
      await updateEmail(currentUser, email);
      console.log('Final changes string:', changesStr);
      const payload = {
        fullName: displayName,
        email: email,
        changes: arrayUnion(`Profile Edited: ${changesStr} at ${timestamp}`)
      };
      // Update the user's profile in Firestore
      await updateDoc(ref, payload);


      this.notificationService.successMessage('Profile updated successfully');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error(error);
      this.notificationService.firebaseErrorMessage(error);
    } finally {
      this.notificationService.hideLoading();
    }
  }




  async resetPassword() {
    const currentUser = await firstValueFrom(this.authService.currentUser$);
    if (!currentUser) {
      console.error('User is not available');
      return;
    }
    // Reset password logic
    const ref = doc(this.firestore, 'users', currentUser.uid);
    const email = this.authService.currentUser()?.email;
    if (email) {
      this.authService.resetPassword(email);
      await updateDoc(ref, {
        changes: arrayUnion(`Password reset email sent at ${new Date().toISOString()}`)
      })
      this.notificationService.successMessage('Password reset email sent');
    } else {
      // Handle the case where email is null or undefined
      console.error('Email is not available for password reset');
    }
  }


  constructor() {
    effect(() => {
      this.profileForm.patchValue({ ...this.authService.currentUser() });
    })
  }



  email = this.profileForm.get('email');
  displayName = this.profileForm.get('displayName');

}
