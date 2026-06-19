import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly lastPage = input.required<number>();
  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const last = this.lastPage();
    return Array.from({ length: last }, (_, i) => i + 1);
  });

  goTo(page: number): void {
    if (page < 1 || page > this.lastPage() || page === this.currentPage()) {
      return;
    }
    this.pageChange.emit(page);
  }
}
