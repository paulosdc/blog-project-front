import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../model/Post';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../model/User';
import { Comment } from '../../model/Comment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private http: HttpClient, private router: Router){}
  
  private url: string = 'http://localhost:8080/posts';
  private imagensUrl: string = 'http://localhost:8080/api/infra/posts/';
  private userUrl: string = 'http://localhost:8080/';
  private commentUrl: string = 'http://localhost:8080/posts/comments';

  posts: Post[] = [];
  currentImageUrl: string = '';
  newCommentText: string = '';
  newComment: Comment = new Comment();
  postToUpdateWithNewComment: Post = new Post();
  userAuthenticated: User = new User();
  userEmail: string = localStorage.getItem('userAuthenticated') ?? '';

  currentPostCreator: User = new User();

  allComments: Comment[] = [];
  postCommentsMap: Map<Post, Comment[]> = new Map();

  findPosts(): void {
    this.http.get<Post[]>(this.url).subscribe(results => {
      const observables = results.map(post => {
        if (post.content.images && post.content.images.length > 0) {
          return forkJoin(post.content.images.map(image => this.getImageUrl(image)))
            .pipe(
              map(imageUrls => {
                if (post.creator.id !== undefined) {
                  this.currentPostCreator = post.creator;
                } else {
                  post.creator = this.currentPostCreator;
                }
                post.content.images = imageUrls;
                return post;
              })
            );
        } else {
          if (post.creator.id !== undefined) {
            this.currentPostCreator = post.creator;
          } else {
            post.creator = this.currentPostCreator;
          }
          return of(post);
        }
      });
  
      forkJoin(observables).subscribe(updatedPosts => {
        this.posts = updatedPosts.reverse();
        this.createMapWithPostsAndComments();
      });
    });
  }

  ngOnInit(): void {
    this.findComments();
    this.findPosts();
    this.findUserAuthenticated();
  }

  createMapWithPostsAndComments(): void {
    this.posts.forEach(post => {
      const commentsForPost = this.allComments.filter(comment => comment.post.id === post.id);
      this.postCommentsMap.set(post, commentsForPost);
    });

    this.posts = this.posts.map(post => {
      return {
        ...post,
        comments: this.postCommentsMap.get(post) || []
      };
    });
  }

  findComments() : void {
    this.http.get<Comment[]>(this.commentUrl).subscribe(results => this.allComments = results);
  }

  findUserAuthenticated(): void {
    this.http.get<User>(this.userUrl + this.userEmail).subscribe(result => this.userAuthenticated = result);
  }


  redirectUploadContent(): void {
    this.router.navigateByUrl('/upload');
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

  getImageUrl(imageName: string): Observable<string> {
    return this.http.get(this.imagensUrl + imageName, { responseType: 'arraybuffer' }).pipe(
      map((data: ArrayBuffer) => 'data:image/jpeg;base64,' + this.arrayBufferToBase64(data))
    );
  }
  
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    const array = Array.from(uint8Array);
    const binary = String.fromCharCode.apply(null, array);
    return btoa(binary);
  }

  createComment(postId: number): void{
    if(this.newCommentText == ''){
      alert("Você deve inserir um texto no seu comentário!");
      return;
    }
    this.newComment.text = this.newCommentText;
    this.newComment.creator.id = this.userAuthenticated.id;
    this.newComment.post.id = postId;

    this.http.post(this.commentUrl, this.newComment).subscribe((response:any) => {
      alert('Comentário adicionado!');
      this.newCommentText = '';
      this.ngOnInit();
    });
  }

  getPostById(postId: number): Observable<Post> {
    return this.http.get<Post>(this.url + "/" + postId);
  }

  deleteComment(idComment: number): void{
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir o comentário? Esta ação não pode ser desfeita.');

    if(!confirmDelete)
      return;

    this.http.delete(this.commentUrl + "/" + idComment).subscribe((response:any) => {
      this.ngOnInit();
    });
  }

  deletePost(idPost: number): void{
    const confirmDelete = window.confirm('Tem certeza de que deseja excluir o post? Esta ação não pode ser desfeita.');

    if(!confirmDelete)
      return;

    this.http.delete(this.url + "/" + idPost).subscribe((response:any) => {
      this.ngOnInit();
    });
  }

}
