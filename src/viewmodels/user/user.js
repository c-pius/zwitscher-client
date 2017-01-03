import {inject} from 'aurelia-framework';
import ZwitscherService from '../../services/zwitscher-service';
import {EventAggregator} from 'aurelia-event-aggregator';
import {TweetUpdate, LoggedInUserUpdate, UsersChanged} from '../../services/messages';
import {Router} from 'aurelia-router';

@inject(ZwitscherService, EventAggregator, Router)
export class User {

  loggedInUser = {};
  viewedUserID = '';
  viewedUser = {};

  constructor(zs,ea,router) {
    this.zwitscherService = zs;
    this.eventAgregator = ea;
    this.router = router;
    this.loggedInUser = this.zwitscherService.getLoggedInUser();

    this.eventAgregator.subscribe(TweetUpdate, msg => {
      this.refreshUser();
    });

    this.eventAgregator.subscribe(LoggedInUserUpdate, msg => {
      this.refreshUser();
    });
  }

  activate(userID) {
    console.log(userID);
    this.viewedUserID = userID;
    this.refreshUser();
  }

  followUser(userID) {
    this.zwitscherService.followUser(userID).then(result => {
      const indexToRemove = this.loggedInUser.follows.indexOf(userID);
      if (indexToRemove === -1) {
        this.loggedInUser.follows.push(userID);
      }
      this.eventAgregator.publish(new LoggedInUserUpdate({}));
    }).catch(err => {
      console.log('error trying to follow user');
    })
  }

  unfollowUser(userID) {
    this.zwitscherService.unfollowUser(userID).then(result => {
        const indexToRemove = this.loggedInUser.follows.indexOf(userID);
        if (indexToRemove !== -1) {
          this.loggedInUser.follows.splice(indexToRemove, 1);
        }
      this.eventAgregator.publish(new LoggedInUserUpdate({}));
      }
    ).catch(err => {
      console.log('error trying to unfollow user');
    })

  }

  removeUser(userID) {
    this.zwitscherService.removeUser(userID).then(result => {
      //   const indexToRemove = this.loggedInUser.follows.indexOf(userID);
      //   if (indexToRemove !== -1) {
      //     this.loggedInUser.follows.splice(indexToRemove, 1);
      //   }
      // this.refreshUser();
      // this.eventAgregator.publish(new LoggedInUserUpdate({}));

      //https://github.com/aurelia/router/issues/201
      // this.router.navigateToRoute('reload');

        this.eventAgregator.publish(new UsersChanged({}));
      }
    ).catch(err => {
      console.log('error trying to remove user');
    })
  }

  refreshUser(){
    this.zwitscherService.getUser(this.viewedUserID).then(foundUser => {
      this.viewedUser = foundUser;
      this.viewedUser.joinedString = new Date(this.viewedUser.joined).getFullYear();
      this.viewedUser.canFollow = this.loggedInUser._id !== this.viewedUserID;

      //check if loggedInUser is following current user
      var indexOfFollowing = this.loggedInUser.follows.findIndex(followedUserID => {
        return this.viewedUser._id === followedUserID;
      });
      this.viewedUser.isFollowing = indexOfFollowing !== -1;

      //check if user can be deleted (admin function)
      let canDelete = false;
      if (this.loggedInUser._id !== this.viewedUserID &&
          this.loggedInUser.scope === 'admin') {
        canDelete = true;
      }
      this.viewedUser.canDelete = canDelete;

      console.log(foundUser);
    }).catch(err => {
      console.log('viewedUser not found');
      console.log(err);
    });
  }

  goToTimeline(userID){
    this.router.navigateToRoute('userTimeline', { id: userID });
  }
}
