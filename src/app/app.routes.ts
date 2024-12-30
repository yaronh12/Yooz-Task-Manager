import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; // Ensure this path is correct and the file exists
import { LoginComponent } from './components/login/login.component'; // Ensure this path is correct and the file exists
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ProfileComponent } from './components/profile/profile.component';
import { AddTaskComponent } from './components/add-task/add-task.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['']);

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
        ...canActivate(redirectUnauthorizedToLogin)
    },
    {
        path: 'login',
        component: LoginComponent,
        ...canActivate(redirectLoggedInToHome)
    },
    {
        path: 'sign-up',
        component: SignUpComponent,
        ...canActivate(redirectLoggedInToHome)
    },
    {
        path: 'profile',
        component: ProfileComponent,
        ...canActivate(redirectUnauthorizedToLogin)
    },
    {
        path: 'add-task',
        component: AddTaskComponent,
        ...canActivate(redirectUnauthorizedToLogin)
    }
];
