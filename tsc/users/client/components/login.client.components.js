System.register(['angular2/core', '../services/user.client.service', 'angular2/router'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, user_client_service_1, router_1;
    var LoginComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (user_client_service_1_1) {
                user_client_service_1 = user_client_service_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            }],
        execute: function() {
            LoginComponent = (function () {
                function LoginComponent(_service) {
                    this._service = _service;
                    this.user = new user_client_service_1.User('', '');
                    this.errorMsg = '';
                }
                LoginComponent.prototype.login = function () {
                    if (!this._service.login(this.user)) {
                        this.errorMsg = 'Failed to login';
                    }
                };
                LoginComponent = __decorate([
                    core_1.Component({
                        selector: 'login-form',
                        providers: [user_client_service_1.AuthenticationService],
                        directives: [router_1.ROUTER_DIRECTIVES],
                        template: "\n        <div class=\"container\" >\n            <div class=\"title\">\n                Torch MeanJs Starter with Angular 2 \n            </div>\n            <div class=\"panel-body\">\n                <div class=\"row\">\n                    <div class=\"col-md-3\">\n                        <div class=\"col-md-6\">\n                            <label for=\"email\">Username</label>\n                        </div>\n                        <div class=\"input-field col-md-6\">\n                            <input [(ngModel)]=\"user.username\" id=\"email\" \n                                type=\"email\" class=\"validate\">\n                        </div>\n                    </div> \n                </div>\n                 <div class=\"row\">\n                    <div class=\"col-md-3\">\n                        <div class=\"col-md-6\">\n                            <label for=\"password\">Password</label>\n                        </div>\n                        <div class=\"input-field col-md-6\">\n                            <input [(ngModel)]=\"user.password\" id=\"password\" \n                                type=\"password\" class=\"validate\">\n                        </div>\n                    </div> \n                </div>\n\n                <span>{{errorMsg}}</span>\n                <br/>\n                <button (click)=\"login()\" \n                    class=\"btn\" \n                    type=\"submit\" name=\"action\">Sign in</button>\n                <button\n                    class=\"btn\" \n                    [routerLink]=\"['Home']\">Create Account</button>\n            </div>\n        </div>\n    \t"
                    }), 
                    __metadata('design:paramtypes', [user_client_service_1.AuthenticationService])
                ], LoginComponent);
                return LoginComponent;
            }());
            exports_1("LoginComponent", LoginComponent);
        }
    }
});
