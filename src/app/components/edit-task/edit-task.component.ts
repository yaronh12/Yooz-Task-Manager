import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from 'src/app/models/user';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NotificationService } from 'src/app/services/notifications.service';
import { UsersService } from 'src/app/services/users.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, CommonModule],
  template: `
    <h3 class="mat-headline-5 login-title">Edit Task</h3>
    <div mat-dialog-content>
      <form [formGroup]="editTaskForm">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="name?.hasError('required')">
                Name is required
            </mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Description</mat-label>
          <input matInput formControlName="description">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Due Date</mat-label>
          <input matInput formControlName="dueDate" type="date">
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onSave()" color="primary">Save</button>
    </div>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
    `
  ]
})
export class EditTaskComponent {
  formbuilder = inject(FormBuilder);
  usersService = inject(UsersService);
  notificationService = inject(NotificationService);
  dialogRef = inject(MatDialogRef<EditTaskComponent>);
  data = inject(MAT_DIALOG_DATA) as { task: Task };


  // Call the service to add the new task
  editTaskForm: FormGroup = this.formbuilder.group({
    id: [this.data.task.id], // Ensure the id is included
    name: [this.data.task.name, [Validators.required]],
    description: [this.data.task.description],
    dueDate: [this.data.task.dueDate],
    status: [this.data.task.status]
  });

  name = this.editTaskForm.get('name');
  dueDate = this.editTaskForm.get('dueDate');


  // Handle cancel button click
  onCancel(): void {
    this.dialogRef.close();
  }
  // Handle save button click
  onSave(): void {
    if (this.editTaskForm.valid) {
      const updatedTask = { ...this.data.task, ...this.editTaskForm.value };
      this.dialogRef.close(updatedTask);
    }
  }


}
