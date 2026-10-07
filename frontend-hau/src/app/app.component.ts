import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './components/site-header.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent],
  template: `
    <app-site-header />
    <router-outlet />
    <footer class="border-t border-black/5 bg-white">
      <div class="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span class="font-display font-extrabold tracking-normal text-ink">MOBIHUB</span>
        <span>Thiết bị di động · Phụ kiện · Linh kiện</span>
      </div>
    </footer>
  `
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    void this.auth.loadCurrentUser();
  }
}
