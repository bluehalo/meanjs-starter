import {Injectable} from 'angular2/core';
import {Router} from 'angular2/router';
import {Http, Headers} from 'angular2/http';
import 'rxjs/Rx';


export class User {
    constructor(
        public username: string,
        public password: string) { }
}

@Injectable()
export class AuthenticationService {

    constructor(
        private _router: Router,
        private _http: Http) {}

    logout() {
        localStorage.removeItem("user");
        this._router.navigate(['Login']);
    }

    login(user){
        // var authenticatedUser = users[0];//.find(u => u.email === user.email);
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        this._http.post('auth/signin', JSON.stringify(user), {
                headers:headers
            })
            .map(res => res.json())
            .subscribe(
                data => this.saveLogin(data),
                err => this.logError(err),
                () => this.completeLogin()
            );

    }

    saveLogin(loginData) {
        console.log(loginData);
        localStorage.setItem("user", loginData);
    }
    completeLogin() {
        this._router.navigate(['Home']);
    }

    checkCredentials(){
        if (localStorage.getItem("user") === null){
            this._router.navigate(['Login']);
        }
    }

    logError(err) {
        console.error('There was an error: ' + err);
    }
}