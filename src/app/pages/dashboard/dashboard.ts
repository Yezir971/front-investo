import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  computed,
  signal,
  viewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  active?: boolean;
  hasArrow?: boolean;
}

interface BotStatus {
  running: boolean;
  startedAt: Date | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  // ----- Canvas refs (Angular 21 viewChild signal API) -----
  private readonly evolutionCanvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('evolutionCanvas');
  private readonly gainsCanvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('gainsCanvas');
  private readonly distributionCanvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('distributionCanvas');
  private readonly dailyCanvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('dailyCanvas');

  private charts: Chart<any>[] = [];
  private simInterval: ReturnType<typeof setInterval> | null = null;

  // ----- State (signals) -----
  readonly initialCapital = signal<number>(10000);
  readonly currentBalance = signal<number>(13420.55);
  readonly botStatus = signal<BotStatus>({ running: false, startedAt: null });
  readonly activeRange = signal<'7d' | '30d' | '1y'>('30d');

  // Series data (signals)
  readonly balanceSeries = signal<number[]>([
    10000, 10120, 10080, 10250, 10410, 10330, 10580,
    10720, 10650, 10890, 11050, 10970, 11210, 11380,
    11290, 11540, 11720, 11650, 11890, 12050, 11980,
    12230, 12410, 12350, 12580, 12790, 12690, 12950,
    13210, 13420
  ]);

  readonly dailyGains = signal<number[]>([
    120, -40, 170, 160, -80, 250, 140, -70, 240, 160,
    -80, 240, 170
  ]);

  // ----- Derived state (computed) -----
  readonly totalGain = computed(
    () => this.currentBalance() - this.initialCapital()
  );

  readonly gainPercentage = computed(() => {
    const initial = this.initialCapital();
    if (initial === 0) return 0;
    return (this.totalGain() / initial) * 100;
  });

  readonly isProfit = computed(() => this.totalGain() >= 0);

  readonly winRate = computed(() => {
    const gains = this.dailyGains();
    if (gains.length === 0) return 0;
    const wins = gains.filter((g) => g > 0).length;
    return (wins / gains.length) * 100;
  });

  readonly bestDay = computed(() => Math.max(...this.dailyGains()));
  readonly worstDay = computed(() => Math.min(...this.dailyGains()));

  // ----- Static data -----
  readonly menuItems: MenuItem[] = [
    { icon: 'fas fa-tachometer-alt', label: 'DASHBOARD', active: true },
    { icon: 'fas fa-robot', label: 'BOTS', hasArrow: true },
    { icon: 'fas fa-chart-line', label: 'TRADES', hasArrow: true },
    { icon: 'fas fa-wallet', label: 'WALLET' },
    { icon: 'fas fa-history', label: 'HISTORY' },
    { icon: 'fas fa-cog', label: 'STRATEGIES', hasArrow: true },
    { icon: 'fas fa-bell', label: 'ALERTS' },
    { icon: 'fas fa-user-circle', label: 'PROFILE' },
  ];

  // ----- Lifecycle -----
  ngAfterViewInit(): void {
    this.buildAllCharts();

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  // ----- Bot controls -----
  toggleBot(): void {
    const current = this.botStatus();
    if (current.running) {
      this.botStatus.set({ running: false, startedAt: null });
      if (this.simInterval) {
        clearInterval(this.simInterval);
        this.simInterval = null;
      }
    } else {
      this.botStatus.set({ running: true, startedAt: new Date() });
      this.startSimulation();
    }
  }

  /** Live simulation: small random tick added to the current balance. */
  private startSimulation(): void {
    this.simInterval = setInterval(() => {
      const tick = (Math.random() - 0.45) * 80; // slight positive bias
      const newBalance = +(this.currentBalance() + tick).toFixed(2);

      this.currentBalance.set(newBalance);
      this.balanceSeries.update((s) => [...s.slice(1), newBalance]);
      this.dailyGains.update((g) => [...g.slice(1), +tick.toFixed(2)]);

      this.refreshCharts();
    }, 2000);
  }

  setRange(range: '7d' | '30d' | '1y'): void {
    this.activeRange.set(range);
  }

  // ----- Charts -----
  private buildAllCharts(): void {
    this.charts.push(this.createEvolutionChart());
    this.charts.push(this.createGainsChart());
    this.charts.push(this.createDistributionChart());
    this.charts.push(this.createDailyChart());
  }

  private refreshCharts(): void {
    const [evolution, gains, distribution, daily] = this.charts;

    if (evolution) {
      evolution.data.datasets[0].data = [...this.balanceSeries()];
      evolution.update('none');
    }
    if (gains) {
      const series = this.balanceSeries();
      const initial = this.initialCapital();
      gains.data.datasets[0].data = series.map((v) => v - initial);
      gains.update('none');
    }
    if (daily) {
      daily.data.datasets[0].data = [...this.dailyGains()];
      (daily.data.datasets[0] as any).backgroundColor = this.dailyGains().map(
        (v) => (v >= 0 ? '#26d4a6' : '#ff6b8a')
      );
      daily.update('none');
    }
  }

  private gradient(
    ctx: CanvasRenderingContext2D,
    color: string,
    height = 280
  ): CanvasGradient {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, `${color}66`);
    g.addColorStop(1, `${color}00`);
    return g;
  }

  private createEvolutionChart(): Chart {
    const ctx = this.evolutionCanvas().nativeElement.getContext('2d')!;
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.balanceSeries().map((_, i) => `D${i + 1}`),
        datasets: [
          {
            label: 'Solde',
            data: [...this.balanceSeries()],
            borderColor: '#26d4a6',
            backgroundColor: this.gradient(ctx, '#26d4a6'),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#26d4a6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: this.commonLineOptions(),
    };
    return new Chart(ctx, config);
  }

  private createGainsChart(): Chart {
    const ctx = this.gainsCanvas().nativeElement.getContext('2d')!;
    const initial = this.initialCapital();
    const data = this.balanceSeries().map((v) => v - initial);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: data.map((_, i) => `D${i + 1}`),
        datasets: [
          {
            label: 'Gain cumulé',
            data,
            borderColor: '#0091ea',
            backgroundColor: this.gradient(ctx, '#0091ea', 200),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: this.commonLineOptions(),
    };
    return new Chart(ctx, config);
  }

  private createDistributionChart(): Chart {
    const ctx = this.distributionCanvas().nativeElement.getContext('2d')!;
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Capital initial', 'Gains nets'],
        datasets: [
          {
            data: [this.initialCapital(), this.totalGain()],
            backgroundColor: ['#0091ea', '#26d4a6'],
            borderColor: '#1c2735',
            borderWidth: 4,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
          },
        },
      },
    };
    return new Chart(ctx, config);
  }

  private createDailyChart(): Chart {
    const ctx = this.dailyCanvas().nativeElement.getContext('2d')!;
    const data = this.dailyGains();
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: data.map((_, i) => `J${i + 1}`),
        datasets: [
          {
            label: 'Gain quotidien',
            data: [...data],
            backgroundColor: data.map((v) => (v >= 0 ? '#26d4a6' : '#ff6b8a')),
            borderRadius: 4,
            barThickness: 14,
          },
        ],
      },
      options: this.commonBarOptions(),
    };
    return new Chart(ctx, config);
  }

  private commonLineOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(28,39,53,0.95)',
          borderColor: 'rgba(38,212,166,0.4)',
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
        },
        x: {
          grid: { display: false },
          ticks: {
            color: 'rgba(255,255,255,0.5)',
            font: { size: 10 },
            maxTicksLimit: 8,
          },
        },
      },
    };
  }

  private commonBarOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
        },
      },
    };
  }
}