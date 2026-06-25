import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { BottomNav } from './shared/bottom-nav/bottom-nav';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, BottomNav],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Inject here to guarantee the service initialises (applies dir/lang) on startup.
  constructor(private _ts: TranslationService) {}
}
