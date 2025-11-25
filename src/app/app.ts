import { Component, signal } from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, Subscription} from 'rxjs';
import {AuthService} from './serives/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  title = 'Task Board App';

  username = signal('');
  showNavbar = signal(false);
  currentUrl = signal('');
  isLoggedIn = signal(false);

  private authSubscription: Subscription;
  private routerSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Estado inicial
    this.isLoggedIn.set(this.authService.isLoggedIn());

    // Suscribirse a cambios en el usuario
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.username.set(user?.username || '');
      this.isLoggedIn.set(!!user);
    });

    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.currentUrl.set(url);
        this.showNavbar.set(url !== '/login' && url !== '/register' && this.authService.isLoggedIn());
      });

    // Verificar estado inicial de ruta
    this.currentUrl.set(this.router.url);
    this.showNavbar.set(this.router.url !== '/login' && this.router.url !== '/register' && this.authService.isLoggedIn());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

}
