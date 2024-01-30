import { HttpInterceptorFn } from '@angular/common/http';

export const userauthenticateInterceptor: HttpInterceptorFn = (req, next) => {;
  const token = localStorage.getItem('loginToken');
  const newCloneRequest = req.clone({
    setHeaders:{
      Authorization: `Bearer ${token}`
    }
  });
  return next(newCloneRequest);
};
