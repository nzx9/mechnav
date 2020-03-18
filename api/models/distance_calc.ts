interface Coords {
  coords1: LatLng;
  coords2: LatLng;
}

interface LatLng {
  lat: number;
  lng: number;
}

class Calc {
  private pi = Math.PI;

  toRadians(degrees: number) {
    return degrees * (this.pi / 180);
  }
  calcDistance(coords: Coords) {
    // haversine formula
    let lat1_Rad = this.toRadians(coords.coords1.lat);
    let lat2_Rad = this.toRadians(coords.coords2.lat);
    let diff_lat = lat2_Rad - lat1_Rad;
    let diff_lng = this.toRadians(coords.coords2.lng - coords.coords1.lng);
    let a =
      Math.pow(Math.sin(diff_lat / 2), 2) +
      Math.cos(lat1_Rad) *
        Math.cos(lat2_Rad) *
        Math.pow(Math.sin(diff_lng / 2), 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c; //in km
  }
}

export { Calc };