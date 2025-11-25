import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {TodoInterface} from "../interfaces/todo.interface";

@Injectable({
  providedIn: 'root',
})
export class Task {

  private apiUrl = 'https://todo-angular.projects.20022004.xyz/api/todos'; // Ajusta según tu API

  constructor(
    private http: HttpClient,
    private authService:  AuthService,
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getAllTasks(): Observable<TodoInterface[]> {
    return this.http.get<TodoInterface[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTaskById(id: number): Observable<TodoInterface> {
    return this.http.get<TodoInterface>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTask(task: TodoInterface): Observable<TodoInterface> {
    return this.http.post<TodoInterface>(this.apiUrl, task, { headers: this.getHeaders() });
  }

  updateTask(id: number, task: TodoInterface): Observable<TodoInterface> {
    return this.http.put<TodoInterface>(`${this.apiUrl}/${id}`, task, { headers: this.getHeaders() });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateTaskStatus(id: number, isCompleted: boolean): Observable<TodoInterface> {
    const updateData = { isCompleted };
    return this.http.put<TodoInterface>(`${this.apiUrl}/${id}`, updateData, { headers: this.getHeaders() });
  }
}
