import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { User } from '../../model/User';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(private http: HttpClient, private router: Router){}

  private url: string = 'http://localhost:8080';
  userAuthenticated: User = new User();
  userEmail: string = localStorage.getItem('userAuthenticated') ?? '';

  findUserAuthenticated(): void {
    this.http.get<User>(this.url + "/" + this.userEmail).subscribe(result => this.userAuthenticated = result);
  }

  ngOnInit(): void {
    this.findUserAuthenticated();
  }

  onLogoff() {
    const confirmLogoff = window.confirm('Tem certeza de que deseja sair?');
    if(!confirmLogoff){
      return;
    }
    localStorage.removeItem('loginToken');
    localStorage.removeItem('userAuthenticated');
    this.router.navigateByUrl('/login');
  }

  redirectUploadContent(): void {
    this.router.navigateByUrl('/upload');
  }

  redirectHomePage(): void {
    this.router.navigateByUrl('/posts');
  }

  cancel(): void{
    this.redirectHomePage();
  }

  updateUser(): void {
    this.http.put(this.url, this.userAuthenticated).subscribe((response:any) => {
      this.router.navigateByUrl('/posts');
    });
  }

  deleteUser(): void {
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir o usuário? Esta ação não pode ser desfeita.');

    if(!confirmDelete)
      return;

    this.http.delete(this.url + "/" + this.userAuthenticated.id).subscribe((response:any) => {
      this.onLogoff();
    });
  }
}
