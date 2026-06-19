import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly menuOpen = signal(false);

  constructor(public authService: AuthService) {}

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
