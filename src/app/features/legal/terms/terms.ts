import { Component } from '@angular/core';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-terms',
  imports: [TranslatePipe],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms {}
