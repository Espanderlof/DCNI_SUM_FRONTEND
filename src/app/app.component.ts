import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'alertas-medicas';
  private readonly _destroying$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar MSAL
      this.msalService.initialize().subscribe({
        next: () => {
          // Manejar la redirección después de la inicialización
          this.msalService.handleRedirectObservable().subscribe();
        },
        error: (error) => {
          console.error('Error inicializando MSAL:', error);
        }
      });

      // Monitorear el estado de la interacción
      this.msalBroadcastService.inProgress$
        .pipe(
          filter((status: InteractionStatus) => status === InteractionStatus.None),
          takeUntil(this._destroying$)
        )
        .subscribe(() => {
          this.checkAndSetActiveAccount();
        });
    }
  }

  private checkAndSetActiveAccount(): void {
    if (isPlatformBrowser(this.platformId)) {
      const activeAccount = this.msalService.instance.getActiveAccount();
      if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
        this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}