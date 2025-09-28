import axios from "axios";

axios.get("http://138.2.124.34:8000/api/regions?parent_id=1")
  .then(res => console.log("OK:", res.data))
  .catch(err => console.error("ERR:", err));
