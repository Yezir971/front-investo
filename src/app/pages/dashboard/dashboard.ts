import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Dashboard as DashboardService } from '../../services/dashboard';
import { Keys } from '../../services/keys';

interface KeyForm {
  exchange: string;
  api_key: string;
  api_secret: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage implements OnInit {
  private cookies = inject(CookieService);
  private dashboardService = inject(DashboardService);
  private keysService = inject(Keys);

  userId = signal<string>('');
  balance = signal<number | null>(null);
  asset = signal<string>('EUR');
  isBotActive = signal<boolean>(false);
  loading = signal<boolean>(false);
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  keyForm = signal<KeyForm>({
    exchange: 'cryptocom',
    api_key: '',
    api_secret: '',
  });

  ngOnInit(): void {
    const id = this.cookies.get('user_id');
    this.userId.set(id);
    if (id) {
      this.refreshBalance();
      this.refreshStatus();
    }
  }

  refreshBalance() {
    if (!this.userId()) return;
    this.dashboardService.infoClient(this.userId()).subscribe({
      next: (res) => {
        this.balance.set(res.balance);
        this.asset.set(res.asset);
      },
      error: () => this.notify('error', 'Impossible de récupérer le solde.'),
    });
  }

  refreshStatus() {
    if (!this.userId()) return;
    this.dashboardService.botStatus(this.userId()).subscribe({
      next: (res) => this.isBotActive.set(res.is_active),
      error: () => {},
    });
  }

  startBot() {
    if (!this.userId()) return;
    this.loading.set(true);
    this.keysService.launch_bot(this.userId()).subscribe({
      next: (res) => {
        this.isBotActive.set(res.is_active ?? true);
        this.notify('success', 'Bot démarré.');
        this.loading.set(false);
      },
      error: () => {
        this.notify('error', 'Échec du démarrage du bot.');
        this.loading.set(false);
      },
    });
  }

  stopBot() {
    if (!this.userId()) return;
    this.loading.set(true);
    this.keysService.stop_bot(this.userId()).subscribe({
      next: (res) => {
        this.isBotActive.set(res.is_active ?? false);
        this.notify('success', 'Bot arrêté.');
        this.loading.set(false);
      },
      error: () => {
        this.notify('error', "Échec de l'arrêt du bot.");
        this.loading.set(false);
      },
    });
  }

  submitKeys(event: Event) {
    event.preventDefault();
    if (!this.userId()) return;
    const form = this.keyForm();
    this.loading.set(true);
    this.keysService
      .send_key({
        user_id: this.userId(),
        exchange: form.exchange,
        api_key: form.api_key,
        api_secret: form.api_secret,
      })
      .subscribe({
        next: () => {
          this.notify('success', 'Clés API enregistrées.');
          this.keyForm.set({ exchange: form.exchange, api_key: '', api_secret: '' });
          this.loading.set(false);
        },
        error: () => {
          this.notify('error', "Échec de l'enregistrement des clés.");
          this.loading.set(false);
        },
      });
  }

  updateKeyField<K extends keyof KeyForm>(field: K, value: KeyForm[K]) {
    this.keyForm.update((current) => ({ ...current, [field]: value }));
  }

  private notify(type: 'success' | 'error', message: string) {
    this.feedback.set({ type, message });
    setTimeout(() => this.feedback.set(null), 3500);
  }
}
