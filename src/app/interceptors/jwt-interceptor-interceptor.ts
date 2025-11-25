import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../serives/auth.service';

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔐 JWT Interceptor - Token presente:', !!token);

  if (token) {
    // Clonar la request y agregar el header Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Header Authorization agregado');
    return next(authReq);
  }

  console.log('ℹ️ Request sin token - continuando...');
  return next(req);

};
