import { Routes } from '@angular/router';
import {authGuard} from './guards/auth-guard';
import {TaskBoard} from './components/task-board/task-board';
import {Login} from './components/login/login';
import {Register} from './components/register/register';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'board',
    component: TaskBoard,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  { path: '**', redirectTo: '/board' }
];
