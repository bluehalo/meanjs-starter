import {Component} from 'angular2/core';
import {AuthenticationService, User} from '../services/user.client.service'
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'login-form',
    providers: [AuthenticationService],
    directives: [ROUTER_DIRECTIVES],
    template: `
        <div class="container" >
            <div class="title">
                Torch MeanJs Starter with Angular 2 
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-3">
                        <div class="col-md-6">
                            <label for="email">Username</label>
                        </div>
                        <div class="input-field col-md-6">
                            <input [(ngModel)]="user.username" id="email" 
                                type="email" class="validate">
                        </div>
                    </div> 
                </div>
                 <div class="row">
                    <div class="col-md-3">
                        <div class="col-md-6">
                            <label for="password">Password</label>
                        </div>
                        <div class="input-field col-md-6">
                            <input [(ngModel)]="user.password" id="password" 
                                type="password" class="validate">
                        </div>
                    </div> 
                </div>

                <span>{{errorMsg}}</span>
                <br/>
                <button (click)="login()" 
                    class="btn" 
                    type="submit" name="action">Sign in</button>
                <button
                    class="btn" 
                    [routerLink]="['Home']">Create Account</button>
            </div>
        </div>
    	`
})

export class LoginComponent {

    public user = new User('','');
    public errorMsg = '';

    constructor(
        private _service:AuthenticationService) {}

    login() {
        if(!this._service.login(this.user)){
            this.errorMsg = 'Failed to login';
        }
    }
}
