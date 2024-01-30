import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Content } from '../../model/Content';
import { Post } from '../../model/Post';
import { User } from '../../model/User';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  constructor(private http: HttpClient, private router: Router){}

  private url:string = 'http://localhost:8080/posts';
  private userUrl: string = 'http://localhost:8080/';

  newContent: Content = new Content();
  newPost: Post = new Post();
  imagesList: string[] = [];
  imagesListBlob: string[] = [];

  userAuthenticated: User = new User();
  userEmail: string = localStorage.getItem('userAuthenticated') ?? '';

  post: Post = new Post();

  onFileSelected(event: any): void {
    const selectedFiles: FileList = event?.target.files;
    if (selectedFiles && selectedFiles.length > 3) {
      alert('Escolha no máximo 3 imagens!');
      return;
    }
    if (selectedFiles && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const currentFile: File = selectedFiles[i];
  
        if (this.isImageFile(currentFile)) {
          this.convertFileToBase64(currentFile).then(base64String => {
            this.imagesList.push(base64String);
            this.newContent.images = this.imagesList;
            this.imagesListBlob.push(URL.createObjectURL(currentFile));
          });
        } else {
          alert(`O arquivo ${currentFile.name} não é uma imagem válida.`);
        }
      }
      this.newContent.text = this.post.content.text;
      this.post.content = this.newContent;
    }
  }
  
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Remove o prefixo 'data:image/png;base64,'
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsDataURL(file);
    });
  }

  private isImageFile(file: File): boolean {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    return allowedImageTypes.includes(file.type);
  }

  createPost(): void {
    this.post.creator.id = this.userAuthenticated.id;
    this.http.post(this.url, this.post).subscribe((response:any) => {
        this.router.navigateByUrl('/posts');
    });
  }

  findUserAuthenticated(): void {
    this.http.get<User>(this.userUrl + this.userEmail).subscribe(result => this.userAuthenticated = result);
  }

  ngOnInit(): void {
    this.findUserAuthenticated();
  }

  redirectHomePage(): void {
    this.router.navigateByUrl('/posts');
  }

  redirectProfilePage(): void {
    this.router.navigateByUrl('/profile');
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
  
}
