import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { TemplateListComponent } from './components/templates/template-list/template-list.component';
import { TemplateEditorComponent } from './components/templates/template-editor/template-editor.component';
import { TemplateDetailComponent } from './components/templates/template-detail/template-detail.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ContactComponent } from './components/contact/contact.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/templates', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'templates', component: TemplateListComponent, canActivate: [authGuard] },
  { path: 'templates/new', component: TemplateEditorComponent, canActivate: [authGuard] },
  { path: 'templates/:id', component: TemplateDetailComponent, canActivate: [authGuard] },
  { path: 'templates/:id/edit', component: TemplateEditorComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '/templates' }
];
