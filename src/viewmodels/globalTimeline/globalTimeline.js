import {inject} from 'aurelia-framework';
import ZwitscherService from '../../services/zwitscher-service';

@inject(ZwitscherService)
export class GlobalTimeline {

  // donations = [];

  constructor(zs) {
    this.zwitscherService = zs;
    // this.donations = this.zwitscherService.donations;
  }
}
