import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <span class="brand-icon">📧</span>
          <a routerLink="/templates" class="brand-text">Email Templates</a>
        </div>
        <div class="navbar-menu">
          <a routerLink="/templates" routerLinkActive="active" class="nav-link">
            <span>📋</span> Mes Templates
          </a>
          <a routerLink="/templates/new" routerLinkActive="active" class="nav-link">
            <span>➕</span> Nouveau Template
          </a>
          <div class="user-menu" *ngIf="currentUser">
            <div class="user-info">
              <span class="user-avatar">{{ getInitials() }}</span>
              <span class="user-name">{{ currentUser.full_name }}</span>
            </div>
            <div class="user-dropdown" *ngIf="currentUser.role === 'admin'">
              <a routerLink="/admin" class="dropdown-item">
                <span>⚙️</span> Dashboard Admin
              </a>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="logout()">
              <span>🚪</span> Déconnexion
            </button>
          </div>
          <div *ngIf="!currentUser" class="auth-links">
            <a routerLink="/login" class="nav-link">Connexion</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      color: white;
      padding: 0;
      box-shadow: var(--box-shadow);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      font-size: 24px;
    }

    .brand-text {
      color: white;
      text-decoration: none;
      font-size: 20px;
      font-weight: 700;
      transition: var(--transition);
    }

    .brand-text:hover {
      opacity: 0.9;
      transform: scale(1.05);
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: var(--border-radius);
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .nav-link:hover,
    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .user-name {
      font-weight: 600;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .navbar-container {
        flex-direction: column;
        gap: 12px;
      }

      .navbar-menu {
        flex-wrap: wrap;
        justify-content: center;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getInitials(): string {
    if (!this.currentUser) return '?';
    const names = this.currentUser.full_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
