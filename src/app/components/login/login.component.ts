import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notifications.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { UsersService } from 'src/app/services/users.service';
import { Task } from 'src/app/models/user';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule],
  template: `
    <div class="card mat-elevation-z5">
    <h3 class="mat-headline-5 login-title">Login</h3>

      <div class="center">
        <img class="social-login" role="button" 
        src="/assets/images/google-sign-in.png"
        width="70%"
        (click)="googleSignIn()"/>
      </div>
      <div class="seperator">-- OR --</div>
      <form [formGroup]="loginForm" (ngSubmit)="login()">
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
          <div class="center margin-top">
              <button type="submit" mat-raised-button color="primary">Login</button>
          </div>
          
      </form>
      <div class="helper-buttons">
  <button class="link-button styled-link" mat-button (click)="goToSignUp()">Sign Up</button>
  <button class="forgot-password-button styled-link" mat-button (click)="forgotPassword()">Forgot Password?</button>
</div>


    </div>
    
  `,
  styles: [`
        .seperator{
          margin-top: 16px;
          margin-bottom: 16px;
          text-align: center;
        }

        .social-login {
          margin-top: 10px;
          cursor: pointer;
        }

       



        
    `
  ]
})
export class LoginComponent {
  formbuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  usersService = inject(UsersService);

  loginForm = this.formbuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Handle login form submission
  async login() {
    const { email, password } = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password) {
      return;
    }


    try {
      this.notificationService.showLoading();
      // Call the AuthService to log in the user
      await this.authService.login(email, password);
      this.notificationService.successMessage('Logged in successfully');
      // Navigate to the home page
      this.router.navigate(['']);
    }
    catch (error: any) {
      console.log(error);
      this.notificationService.firebaseErrorMessage(error);
    }
    finally {
      this.notificationService.hideLoading();
    }


  }

  // Navigate to sign-up page
  goToSignUp() {
    this.router.navigate(['sign-up']);
  }

  async googleSignIn() {
    try {
      this.notificationService.showLoading();
      const newUser = await this.authService.googleLogin();
      if (newUser) {
        console.log(newUser);
        const emptyTasksArray: Task[] = [];
        const emptyChangesArray: string[] = [];
        const userProfile = {
          uid: newUser['uid'] as string,
          fullName: newUser['fullName'] as string,
          email: newUser['email'] as string,
          tasks: emptyTasksArray,
          changes: emptyChangesArray
        };
        console.log(userProfile);
        await this.usersService.addUser(userProfile);
      }

      this.router.navigate(['']);
      this.notificationService.successMessage('Logged in successfully');
    }
    catch (error: any) {
      console.log(error);
      this.notificationService.firebaseErrorMessage(error);
    }
    finally {
      this.notificationService.hideLoading();
    }

  }

  // Handle forgot password
  async forgotPassword() {
    const email = this.loginForm.value.email;
    if (!email) {
      this.notificationService.errorMessage('Please enter your email address to reset your password.');
      return;
    }

    try {
      this.notificationService.showLoading();
      // Call the AuthService to send a password reset email
      await this.authService.resetPassword(email);
      this.notificationService.successMessage('Password reset email sent successfully.');
    } catch (error: any) {
      console.log(error);
      this.notificationService.firebaseErrorMessage(error);
    } finally {
      this.notificationService.hideLoading();
    }
  }

  email = this.loginForm.get('email');
  password = this.loginForm.get('password');
}


