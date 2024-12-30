import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from 'src/app/services/users.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from 'src/app/services/notifications.service';
import { MatSelectModule } from '@angular/material/select';
import { Task } from 'src/app/models/user';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule,
    MatProgressSpinnerModule, MatIconModule, MatButtonModule,
    MatSortModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatToolbarModule, MatPaginatorModule, MatTableModule, RouterLink, MatDialogModule],
  template: `
  <div class="mat-elevation-z8">
    <div id="top-home">
  <mat-form-field>
    <mat-label>Search Tasks</mat-label>
    <input matInput (keyup)="applyFilter($event)" placeholder="Search tasks">
  </mat-form-field>


<mat-card *ngIf="tasks.length === 0" class="no-tasks-card">
  <div class="no-tasks-content">
    <mat-icon class="no-tasks-icon">sentiment_satisfied_alt</mat-icon>
    <span class="no-tasks-text">No Tasks</span>
  </div>
</mat-card>


  <button mat-raised-button type="button" routerLink="/add-task" class="add-task-button">
  <mat-icon class="button-icon">add</mat-icon>
  Add Task
</button>

  </div>
  <table mat-table [dataSource]="dataSource" matSort class="full-width-table">

    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
      <td mat-cell *matCellDef="let element">{{ element.name }}</td>
    </ng-container>

    <!-- Description Column -->
    <ng-container matColumnDef="description">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Description</th>
      <td mat-cell *matCellDef="let element">{{ element.description }}</td>
    </ng-container>

    <!-- Due Date Column -->
    <ng-container matColumnDef="dueDate">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Due Date</th>
      <td mat-cell *matCellDef="let element">{{ element.dueDate | date: 'short' }}</td>
    </ng-container>

       <!-- Status Column -->
       <ng-container matColumnDef="status">
        <th mat-header-cell  *matHeaderCellDef mat-sort-header>Status</th>
        <td mat-cell *matCellDef="let element">
          <mat-form-field appearance="outline" class="status-dropdown">
            <mat-select  [(value)]="element.status" (selectionChange)="changeStatus(element, $event.value)">
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="in process">In Process</mat-option>
              <mat-option value="done">Done</mat-option>
            </mat-select>
          </mat-form-field>
        </td>
      </ng-container>

    <!-- Actions Column -->
    <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let element">
        <button mat-icon-button color="primary" (click)="openEditDialog(element)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="removeTask(element)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

    <!-- Header and Row Definitions -->
    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
</div>

  `,
  styles: [
    `
    
    .full-width-table {
  width: 100%;
  margin: 16px 0;
}

.mat-form-field {
  width: 100%;
  margin-bottom: 16px;
}

.mat-elevation-z8 {
  border-radius: 8px;
  padding: 16px;
  background: white;
}

    .status-dropdown {
      display: flex;
  justify-content: center; /* Centers horizontally */
  align-items: center; /* Centers vertically (if needed) */
  height: 100%; 
      width: 150px;
    }

  #top-home{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .no-tasks-card {
  
  background-color: #c8e6c9; /* Light green */
  color: #2e7d32; /* Dark green */
  border-radius: 12px;
  padding: 10px;
  margin: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.no-tasks-card:hover {
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2); /* Subtle hover effect */
  cursor: default;
}
.no-tasks-content {
  display: inline-block; /* Inline block ensures items are in the same line */
  vertical-align: middle; /* Vertically center the content */
}

.no-tasks-icon {
  font-size: 25px;
  vertical-align: middle; /* Align the icon with the text */
  margin-right: 8px;
}

.no-tasks-text {
  font-size: 20px;
  font-weight: bold;
}


.add-task-button {
  background-color: #e1bee7; /* Soft lavender pink background */
  color: #4a148c; /* Deep purple text color for contrast */
  font-size: 16px; /* Font size */
  font-weight: bold; /* Bold text */
  padding: 10px 20px; /* Padding around the button */
  border-radius: 8px; /* Rounded corners */
  text-transform: none; /* Prevent uppercase transformation */
  display: flex; /* Align icon and text horizontally */
  align-items: center; /* Center alignment vertically */
  gap: 8px; /* Space between icon and text */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  transition: background-color 0.3s ease, box-shadow 0.3s ease; /* Smooth hover */
}

.add-task-button:hover {
  background-color: #d1c4e9; /* Slightly darker lavender for hover */
  box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15); /* Larger shadow on hover */
}

.button-icon {
  font-size: 20px; /* Icon size */
}




    `
  ]
})

export class HomeComponent implements OnInit {

  tasks: Task[] = [];
  displayedColumns: string[] = ['name', 'description', 'dueDate', 'status', 'actions'];
  dataSource!: MatTableDataSource<Task>;

  private usersService = inject(UsersService);
  dialog = inject(MatDialog);
  notifications = inject(NotificationService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Initialize component and fetch tasks
  async ngOnInit() {
    this.usersService.getCurrentUserTasks().subscribe(
      (tasks) => {
        this.tasks = tasks;
        console.log(tasks);
        this.dataSource = new MatTableDataSource(this.tasks);
        this.dataSource.data = this.tasks;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        this.notifications.errorMessage(error.message)
      }
    )
  }

  // Attach paginator and sorting after view initialization
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator; // Attach paginator
      this.dataSource.sort = this.sort; // Attach sorting
    }
  }

  // Apply filter to the tasks table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Remove a task
  async removeTask(task: Task) {
    try {
      // Call the service to remove the task
      await this.usersService.removeTask(task);
      // Update the local tasks array and data source
      this.tasks = this.tasks.filter(t => t !== task);
      this.dataSource.data = this.tasks;
    } catch (error) {
      console.error('Error removing task:', error);
    }
  }

  // Change the status of a task
  async changeStatus(task: Task, newStatus: string) {
    try {
      // Call the service to change the task status
      await this.usersService.changeStatus(task, newStatus);
      // Update the task status locally
      task.status = newStatus;
    } catch (error) {
      console.error('Error changing task status:', error);
    }
  }

  // Open the edit task dialog
  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(EditTaskComponent, {
      width: '400px',
      data: { task }
    });

    // Handle the result from the dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editTask(result);
      }
    });
  }

  // Edit a task
  async editTask(updatedTask: Task) {
    try {
      // Call the service to edit the task
      await this.usersService.editTask(updatedTask);
      // Find the index of the updated task in the local tasks array
      const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        // Update the task locally
        this.tasks[index] = updatedTask;
        this.dataSource.data = this.tasks;
      }
    } catch (error) {
      console.error('Error editing task:', error);
    }
  }


}