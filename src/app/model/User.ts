import { Post } from "./Post";

export class User{

    id: number = 0;
    name: string = '';
    username: string = '';
    email: string = '';
    password: string = '';
    posts: Post[] = [];
    
}