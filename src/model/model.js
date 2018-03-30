
import {subscribe} from "../utils";

subscribe('data.new', (topic, obj) => shared_msc = obj);

export let shared_msc =  null;
