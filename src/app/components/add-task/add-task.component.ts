import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { passwordsMatchValidator } from '../sign-up/sign-up.component';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { Task } from 'src/app/models/user';
import { NotificationService } from 'src/app/services/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule],
  template: `
    <div class="card mat-elevation-z5">
    <h3 class="mat-headline-5 login-title">Add Task</h3>
      <form [formGroup]="addTaskForm" (ngSubmit)="addTask()">
        <mat-form-field>
            <mat-label>Name</mat-label>
            <input matInput formControlName="name">
            <!-- Error messages -->
            <mat-error *ngIf="name?.hasError('required')">
                Name is required
            </mat-error>
        </mat-form-field>
          <mat-form-field>        
              <mat-label>Description</mat-label>
              <input matInput formControlName="description">              
          </mat-form-field>
          <!-- Password input -->
          <mat-form-field> 
              <mat-label>Due Date</mat-label>
              <input matInput type="date" formControlName="date">
          </mat-form-field>
          
          
        
          <div class="center margin-top">
              <button type="submit" mat-raised-button color="primary">Add</button>
          </div>
          <div class="link-button-div"> 
              <button type="button" mat-button class="link-button" (click)="goToSignIn()">
                return to home
              </button>
          </div>
      </form>
    </div>
  `,
  styles: [
  ]
})
export class AddTaskComponent {
  formbuilder = inject(FormBuilder);
  router = inject(Router);
  usersService = inject(UsersService);
  notificationService = inject(NotificationService);

  // Define the form group for adding a task
  addTaskForm = this.formbuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    date: [''],
  });

  // Handle form submission to add a new task
  async addTask() {
    const newTask: Task = {
      id: uuidv4(),
      name: this.addTaskForm.value.name || '',
      description: this.addTaskForm.value.description || '',
      dueDate: this.addTaskForm.value.date ? new Date(this.addTaskForm.value.date) : new Date(),
      status: 'pending',
    };

    try {
      this.notificationService.showLoading();
      console.log(newTask);
      // Call the service to add the new task
      await this.usersService.addTask(newTask);
      this.notificationService.successMessage('Task Added successfully');
      this.router.navigate(['']);
    }
    catch (error: any) {
      this.notificationService.firebaseErrorMessage(error);
    }
    finally {
      this.notificationService.hideLoading();
    }

  }

  goToSignIn() {
    this.router.navigate(['login']);
  }

  name = this.addTaskForm.get('name');
  description = this.addTaskForm.get('description');
  date = this.addTaskForm.get('date');
}
