const calculateDistance = (coords1, coords2) => {
  // Implementation of the Haversine formula to calculate distance
  const [lon1, lat1] = coords1
  const [lon2, lat2] = coords2
  
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c // Distance in km
  
  return distance
}

module.exports = {
  calculateDistance
}