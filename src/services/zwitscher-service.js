import {inject} from 'aurelia-framework';
import Fixtures from './fixtures';
import {TotalUpdate, LoginStatus} from './messages';
import {EventAggregator} from 'aurelia-event-aggregator';
import AsyncHttpClient from './async-http-client';

@inject(EventAggregator, AsyncHttpClient)
export default class ZwitscherService {

  constructor(ea, ac) {
    this.ea = ea;
    this.ac = ac;
  }

  getUsers() {
    this.ac.get('/api/users').then(res => {
      this.users = res.content;
    });
  }

  register(firstName, lastName, email, password, gender) {
    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      gender: gender,
    };
    this.ac.post('/api/users', newUser).then(res => {
      // this.getUsers();
      console.log(res);
    });
  }

  login(email, password) {
    const user = {
      email: email,
      password: password
    };
    this.ac.authenticate('/api/users/authenticate', user);
  }

  logout() {
    const status = {
      success: false,
      message: ''
    };
    this.ac.clearAuthentication();
    this.ea.publish(new LoginStatus(status));
  }

  isAuthenticated() {
    return this.ac.isAuthenticated();
  }
}
