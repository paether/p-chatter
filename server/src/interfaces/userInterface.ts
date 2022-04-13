export default interface UserInterface {
  username: string;
  password: string;
  email?: string;
  picture?: string;
  friends?: Array<string>;
  id?: string;
}
