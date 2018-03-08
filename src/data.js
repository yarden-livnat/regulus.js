import {MSC} from './model/msc';

let _dataset = new MSC();


let api =  {
  set dataset(_) { _dataset = _ },

  get data() { return _dataset; }
};


export default api;