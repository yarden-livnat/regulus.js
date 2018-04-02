
import {subscribe} from "../utils";

subscribe('data.shared_msc', (topic, obj) => model.shared_msc = obj);
subscribe('data.msc', (topic, obj) => model.msc = obj);
let model = {
  shared_msc: null,
  msc: null,
  features: null,
  color_by: null
};


export function Model() {
  if (!window.regulus)
    window.regulus = window.opener && window.opener.regulus || model;

  return window.regulus;
}