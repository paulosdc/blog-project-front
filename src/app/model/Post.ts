import { Content } from "./Content";
import { Comment } from "./Comment";
import { User } from "./User";

export class Post{

    id: number = 0;
    creator: User = new User();
    content: Content = new Content();
    comments: Comment[] = [];

}