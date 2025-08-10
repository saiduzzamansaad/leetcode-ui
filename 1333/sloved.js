function filterRestaurants(restaurants, veganFriendly, maxPrice, maxDistance) {
      return restaurants
          .filter(restaurant => {
              const [id, rating, vegan, price, distance] = restaurant;
              return (
                  (veganFriendly === 0 || vegan === veganFriendly) &&
                  price <= maxPrice &&
                  distance <= maxDistance
              );
          })
          .sort((a, b) => {
              if (a[1] === b[1]) {
                  return b[0] - a[0]; // higher id first if same rating
              }
              return b[1] - a[1]; // higher rating first
          })
          .map(restaurant => restaurant[0]); // extract ids only
  }