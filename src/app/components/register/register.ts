import {Component, signal} from '@angular/core';
import {RegisterRequest} from '../../interfaces/auth.interface';
import {AuthService} from '../../serives/auth.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userData = signal<RegisterRequest>({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.userData().email || !this.userData().password || !this.userData().username) {
      this.errorMessage.set('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (this.userData().password !== this.userData().confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    if (this.userData().password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const registerData  = this.userData();

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/board']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Error al crear la cuenta. Intenta nuevamente.'
        );
        console.error('Register error:', error);
      }
    });
  }
}
