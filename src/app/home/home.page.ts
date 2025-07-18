import { AfterViewInit, Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';
import { Capacitor } from '@capacitor/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, MatIconModule],
})
export class HomePage implements AfterViewInit{
  userMarker: L.Marker | undefined;
  map: any;

  constructor() {}

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
    this.watchPosition();
  }

  initMap(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
    });

    this.map = L.map('map', {
      zoomControl: false
    }).setView([0, 0], 17);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  async watchPosition(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.updateMap(latitude, longitude);
          },
          (error) => {
            console.error('Web geolocation error:', error);
          },
          {
            enableHighAccuracy: true
          }
        );
      } else {
        console.warn('Web geolocation not available.');
      }
    } else {
      const permission = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
          if (err) {
            console.error('Geolocation error:', err);
            return;
          }

          if (position) {
            const { latitude, longitude } = position.coords;
            this.updateMap(latitude, longitude);
          }
        });
      } else {
        console.warn('Geolocation not available.');
      }
    }
  }

  updateMap(lat: number, lng: number): void {
    this.map.setView([lat, lng], 17);

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    } else {
      const icon = L.icon({
        iconUrl: 'assets/blue_dot.svg',
        iconSize: [30, 30],
        iconAnchor: [12, 12]
      });

      this.userMarker = L.marker([lat, lng], { icon }).addTo(this.map);

      // this.userMarker = L.marker([lat, lng])
      //   .addTo(this.map)
      //   .bindPopup('You are here!')
      //   .openPopup();
    }
  }

  centerMap(): void {
    if (this.userMarker) {
      const latlng = this.userMarker.getLatLng();
      this.map.setView(latlng, 17);
    }
  }
}
