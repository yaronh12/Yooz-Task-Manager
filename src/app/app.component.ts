import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from './services/notifications.service';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink],
  template: `
  <mat-toolbar color="primary">Task Manager
    <button mat-button *ngIf="currentUser()" [mat-menu-trigger-for]="userMenu">
        {{ currentUser()?.displayName }}  
        <mat-icon>expand_more</mat-icon> 
    </button>

    <mat-menu #userMenu="matMenu">
      <button mat-menu-item routerLink="/profile">
        <mat-icon>account_circle</mat-icon>
        Profile
      </button>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        Logout
      </button>
    </mat-menu>
  </mat-toolbar>
  <div class="container">
    <router-outlet></router-outlet>
  </div>

    <mat-progress-spinner 
    mode="indeterminate" 
    diameter="50"
    *ngIf="loading()">
    </mat-progress-spinner>
    `,
  styles: [`
    .container {
      padding: 20px;
    }

    mat-toolbar{
      justify-content: space-between;
    }

    mat-progress-spinner{
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    `
  ],
})
export class AppComponent {
  title = 'yooz-task-manager';

  authService = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  usersService = inject(UsersService);

  currentUser = this.authService.currentUser;

  loading = this.notificationService.loading;

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
