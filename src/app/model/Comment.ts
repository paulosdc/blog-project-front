import { Post } from "./Post";
import { User } from "./User";

export class Comment {

    id: number = 0;
    creator: User = new User();
    text: string = '';
    post: Post = new Post();
    
}