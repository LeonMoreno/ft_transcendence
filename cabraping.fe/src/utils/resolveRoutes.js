import getHash from "./getHash.js";

export default function resolveRoutes(routes, user_location) {

  let render;
  let catch_path;

  // handling getHash, or route ids
  if (getHash() != "/")
  {
    catch_path = `/${user_location[0]}/:id`;
  }
  else
  {
    catch_path = `/${user_location[0]}`;
  }

  // We check that the route exists.
  if (routes[catch_path] && user_location.length >= 1 && user_location.length <= 2)
  {
    render = routes[`/${user_location[0]}`];
  }
  else
  {
    render = routes["/404"];
  }

  return render;
};
