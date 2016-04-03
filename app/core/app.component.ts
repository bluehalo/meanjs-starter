import {Component} from 'angular2/core';
import {LoginComponent} from '../users/client/components/login.client.components';
import {PrivateComponent} from '../users/client/components/logged-demo.client.component';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'my-app',
    directives: [LoginComponent, ROUTER_DIRECTIVES],
    template: `
            <router-outlet></router-outlet>
        `
})
@RouteConfig([
    { path: '/home', name: 'Home', component: PrivateComponent, useAsDefault:true },
    { path: '/login', name: 'Login', component: LoginComponent }
])
export class AppComponent {}