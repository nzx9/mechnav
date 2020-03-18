class UserLocation {
  async getLocation(callback: any) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          callback(null, position);
        },
        err => callback(err, null),
        {
          enableHighAccuracy: true
        }
      );
    } else {
      createAlert(
        "Unsupported browser!",
        "Sorry!, this browser not support GeoLocation API, please update or try using another browser.",
        "OK"
      );
    }
  }

  async getRealTimeLocation(highAccuracy: boolean, callback: any) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position: any) => {
          callback(null, position);
        },
        (err: any) => callback(err, null),
        {
          enableHighAccuracy: highAccuracy
        }
      );
    } else {
      createAlert(
        "Unsupported browser!",
        "Sorry!, this browser not support GeoLocation API, please update or try using another browser.",
        "OK"
      );
    }
  }

  async serverUpdateRealTime(callback?: any) {
    this.getRealTimeLocation(true, (err: any, position: any) => {
      if (err) {
        createAlert("Error", err.message, "OK");
      } else {
        socket.emit("userlocation", {
          userId: userId,
          latlng: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          heading: position.coords.heading,
          timestamp: position.timestamp
        });
        callback;
      }
    });
  }

  async getLocationWithInterval(seconds: number, callback: any) {
    setInterval(
      () => this.getLocation((err: any, pos: any) => callback(err, pos)),
      seconds * 1000
    );
  }
}
