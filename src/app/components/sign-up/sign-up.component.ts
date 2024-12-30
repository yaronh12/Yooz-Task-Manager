import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from 'src/app/services/notifications.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { UsersService } from 'src/app/services/users.service';
import { Task } from 'src/app/models/user';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule],
  template: `
   <div class="card mat-elevation-z5">
   <h3 class="mat-headline-5 login-title">Sign Up</h3>
      <form [formGroup]="signupForm" (ngSubmit)="signup()">
        <mat-form-field>
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName">
            <!-- Error messages -->
            <mat-error *ngIf="fullName?.hasError('required')">
                Full name is required
            </mat-error>
        </mat-form-field>
        <!-- Email input -->
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
          <!-- Password input -->
          <mat-form-field> 
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
               <!-- Error messages -->
               <mat-error *ngIf="password?.hasError('required')">
                  Password is required
              </mat-error> 
          </mat-form-field>
          <mat-form-field> 
              <mat-label>Confirm Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
               <!-- Error messages -->
               <mat-error *ngIf="confirmPassword?.hasError('required')">
                  Confirm Password is required
              </mat-error>  
          </mat-form-field>
          
          <mat-error *ngIf="signupForm?.hasError('passwordsMismatch')">
                  Passwords do not match
          </mat-error>
          <div class="center margin-top">
              <button type="submit" mat-raised-button color="primary">Sign Up</button>
          </div>
          <div class="link-button-div"> 
              <button type="button" mat-button class="link-button" (click)="goToSignIn()">
                return to login
              </button>
          </div>
      </form>
    </div>
  `,
  styles: [
  ]
})
export class SignUpComponent {
  formbuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);
  firestore = inject(Firestore);
  usersService = inject(UsersService);

  // Define the form group for sign-up
  signupForm = this.formbuilder.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: passwordsMatchValidator()
  });

  // Handle form submission to sign up a new user
  async signup() {
    //console.log(this.signupForm.value);
    const { fullName, email, password, confirmPassword } = this.signupForm.value;

    // Check if the form is valid and required fields are filled
    if (!this.signupForm.valid || !fullName || !email || !password) {
      return;
    }

    try {
      this.notificationService.showLoading();

      // Call the AuthService to sign up the user
      const { user, user: { uid } } = await this.authService.signup(email, password);

      // Set the user's full name
      await this.authService.setFullName(user, fullName);

      // Initialize empty arrays for tasks and changes
      const emptyTasksArray: Task[] = [];
      const emptyChangesArray: string[] = [];
      // Add the new user to Firestore
      await this.usersService.addUser({ uid, fullName, email, tasks: emptyTasksArray, changes: emptyChangesArray });

      this.notificationService.successMessage('Signed Up successfully');
      this.router.navigate(['']);
    }
    catch (error: any) {
      //console.log(error);
      this.notificationService.firebaseErrorMessage(error);
    }
    finally {
      this.notificationService.hideLoading();
    }
  }

  goToSignIn() {
    this.router.navigate(['login']);
  }


  email = this.signupForm.get('email');
  password = this.signupForm.get('password');
  fullName = this.signupForm.get('fullName');
  confirmPassword = this.signupForm.get('confirmPassword');
}


// Custom validator to check if password and confirm password match
export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value && confirmPassword?.value && password.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    else {
      return null;
    }
  }

}

