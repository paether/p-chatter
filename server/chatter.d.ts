/* eslint-disable no-unused-vars */
declare namespace Express {
  export interface User {
    id: string;
    _id: string;
    username: string;
    picture: string;
    query: {
      specUserId: string;
      username: string;
    };
    params: {
      id: string;
    };
  }
}
