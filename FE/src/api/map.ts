import client from "./client";

export const getAllMapRestaurants = () =>
  client.get("/api/map/restaurants").then(r => r.data);
