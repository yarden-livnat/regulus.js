
import {subscribe} from "../utils";

subscribe('data.loaded', (topic, obj) => model.shared_msc = obj);

let model = {
  shared_msc: null
};


export function Model() {
  if (!window.regulus)
    window.regulus = window.opener && window.opener.regulus || model;

  return window.regulus;
}