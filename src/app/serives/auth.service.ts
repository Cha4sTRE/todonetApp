import {Injectable, signal} from '@angular/core';
import {BehaviorSubject, Observable, tap} from "rxjs";
import {AuthResponse, LoginRequest, RegisterRequest, User} from '../interfaces/auth.interface';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://todo-angular.projects.20022004.xyz/api'; // URL con proxy
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated = signal<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
          this.isAuthenticated.set(true);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, userData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
          this.isAuthenticated.set(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setCurrentUser(user: User): void {
    const userData = JSON.stringify(user);
    localStorage.setItem(this.userKey, userData);
    this.currentUserSubject.next(user);
  }

  private getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.userKey);

      // Si es null, undefined o string vacío, retornar null
      if (!userStr) {
        return null;
      }

      // Intentar parsear el JSON
      const user = JSON.parse(userStr);

      // Verificar que tenga la estructura básica de User
      if (user && typeof user === 'object' && user.email) {
        return user as User;
      } else {
        console.warn('User data in localStorage is invalid:', user);
        this.clearInvalidData();
        return null;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.clearInvalidData();
      return null;
    }
  }

  private clearInvalidData(): void {
    // Limpiar datos corruptos
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
  }
}
